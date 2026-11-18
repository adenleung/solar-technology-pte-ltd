import { z } from "zod";
import {
  calculateLayout,
  parsePlannerConfig,
} from "../../components/solar/planner/plannerModel.ts";
import {
  BUILDING_TYPES,
  CONSENT_VERSION,
  MAX_FILE_BYTES,
  MAX_REQUEST_BYTES,
} from "./quote.ts";

const clean = (max: number) => z.string().trim().max(max);
const schema = z.object({
  id: z.string().uuid(),
  name: clean(120).min(1),
  company: clean(160),
  email: clean(254).email(),
  phone: clean(40).refine((s) => !s || /^[+0-9 ()-]{6,40}$/.test(s)),
  location: clean(220).min(2),
  buildingType: z.enum(BUILDING_TYPES),
  roof: clean(450),
  interest: clean(140).min(1),
  requirements: clean(4000),
  consent: z.literal("yes"),
  website: z.literal(""),
});
const json = (status: number, body: unknown) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
class InputError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
async function readBounded(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_REQUEST_BYTES)
    throw new InputError(413, "Choose a drawing of 5 MB or less.");
  if (!request.body) throw new InputError(400, "An enquiry form is required.");
  const type = request.headers.get("content-type") || "";
  if (!type.startsWith("multipart/form-data"))
    throw new InputError(
      415,
      "Submit the project form with its original encoding.",
    );
  const reader = request.body.getReader(),
    chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    for (;;) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new InputError(413, "Choose a drawing of 5 MB or less.");
      }
      chunks.push(new Uint8Array(item.value));
    }
    return await new Response(new Blob(chunks), {
      headers: { "Content-Type": type },
    }).formData();
  } catch (e) {
    if (e instanceof InputError) throw e;
    throw new InputError(
      400,
      "The form could not be decoded. Please try again.",
    );
  }
}
async function sha(data: BufferSource | string) {
  const buf = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buf)),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
function drawingType(bytes: Uint8Array) {
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10
  )
    return { ext: "png", mime: "image/png" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { ext: "jpg", mime: "image/jpeg" };
  if (String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-")
    return { ext: "pdf", mime: "application/pdf" };
  throw new InputError(422, "The drawing must be a PDF, JPEG or PNG file.");
}
type Entry = {
  id: string;
  reference: string;
  fingerprint: string;
  status: string;
  drawing_key: string | null;
};
export async function receiveEnquiry(
  request: Request,
  bindings: { DB?: D1Database; BUCKET?: R2Bucket },
): Promise<Response> {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).origin !== new URL(request.url).origin)
      return json(403, {
        error: "Use the form on this site to submit an enquiry.",
      });
    const form = await readBounded(request);
    const checked = schema.safeParse(
      Object.fromEntries(
        Object.keys(schema.shape).map((k) => [k, form.get(k) ?? ""]),
      ),
    );
    if (!checked.success)
      return json(422, {
        error: "Check the highlighted enquiry fields.",
        fields: [
          ...new Set(checked.error.issues.map((i) => String(i.path[0]))),
        ],
      });
    const fields = checked.data,
      rawPlan = form.get("configuration");
    let config = null;
    if (rawPlan) {
      if (typeof rawPlan !== "string" || rawPlan.length > 4000)
        throw new InputError(422, "Invalid planner settings.");
      try {
        config = parsePlannerConfig(JSON.parse(rawPlan));
      } catch {
        throw new InputError(422, "Invalid planner settings.");
      }
      if (!config)
        throw new InputError(
          422,
          "Review the planner settings before sending.",
        );
    }
    const summary = config ? calculateLayout(config) : null;
    const configuration =
      config && summary
        ? JSON.stringify({
            inputs: config,
            estimate: {
              modules: summary.moduleCount,
              capacityKwp: summary.capacityKw,
              annualKwh: summary.annualKwh,
            },
          })
        : null;
    const uploaded = form.get("drawing");
    let body: ArrayBuffer | undefined,
      fileType: ReturnType<typeof drawingType> | undefined,
      fileName: string | null = null,
      digest = "";
    if (uploaded && typeof uploaded !== "string" && uploaded.size) {
      if (uploaded.size > MAX_FILE_BYTES)
        throw new InputError(413, "Choose a drawing of 5 MB or less.");
      body = await uploaded.arrayBuffer();
      fileType = drawingType(new Uint8Array(body));
      digest = await sha(body);
      fileName =
        uploaded.name
          .split(/[\\/]/)
          .pop()
          ?.replace(/[\u0000-\u001f\u007f]/g, "")
          .slice(0, 160) || "drawing." + fileType.ext;
    }
    const db = bindings.DB;
    if (!db || (body && !bindings.BUCKET))
      return json(503, {
        error: "Enquiry storage is temporarily unavailable. Please try again.",
      });
    const fingerprint = await sha(
      JSON.stringify([fields, configuration, digest, fileName]),
    );
    const getEntry = () =>
      db
        .prepare(
          "SELECT id,reference,fingerprint,status,drawing_key FROM enquiries WHERE id=?",
        )
        .bind(fields.id)
        .first<Entry>();
    let entry = await getEntry();
    if (!entry) {
      const hour = Math.floor(Date.now() / 3600000);
      const counter = await sha(
        "solar-project-form/" +
          hour +
          "/" +
          (request.headers.get("cf-connecting-ip") || "preview"),
      );
      await db
        .prepare("DELETE FROM submission_windows WHERE hour<?")
        .bind(hour - 2)
        .run();
      const limit = await db
        .prepare(
          "INSERT INTO submission_windows (key,hour,count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<12 RETURNING count",
        )
        .bind(counter, hour)
        .first();
      if (!limit)
        return json(429, {
          error:
            "The hourly enquiry limit has been reached. Please try again later.",
        });
      const reference =
        "ST-" +
        crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
      const key = fileType
        ? "drawings/" +
          crypto.randomUUID() +
          "/" +
          crypto.randomUUID() +
          "." +
          fileType.ext
        : null;
      await db
        .prepare(
          "INSERT INTO enquiries (id,reference,fingerprint,status,created_at,name,company,email,phone,location,building_type,roof_information,product_interest,requirements,configuration,drawing_key,drawing_name,consent_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
        )
        .bind(
          fields.id,
          reference,
          fingerprint,
          body ? "awaiting_drawing" : "received",
          new Date().toISOString(),
          fields.name,
          fields.company,
          fields.email,
          fields.phone,
          fields.location,
          fields.buildingType,
          fields.roof,
          fields.interest,
          fields.requirements,
          configuration,
          key,
          fileName,
          CONSENT_VERSION,
        )
        .run();
      entry = await getEntry();
    }
    if (!entry) throw Error("Enquiry not persisted");
    if (entry.fingerprint !== fingerprint)
      return json(409, {
        error:
          "This request reference already belongs to a different enquiry. Reopen the form to start a new one.",
      });
    if (entry.status === "awaiting_drawing") {
      if (!fileType || !body || !bindings.BUCKET || !entry.drawing_key)
        throw Error("Missing attachment binding");
      await bindings.BUCKET.put(entry.drawing_key, body, {
        httpMetadata: { contentType: fileType.mime },
      });
      await db
        .prepare(
          "UPDATE enquiries SET status='received' WHERE id=? AND fingerprint=?",
        )
        .bind(fields.id, fingerprint)
        .run();
    }
    return json(201, { reference: entry.reference, status: "received" });
  } catch (e) {
    return e instanceof InputError
      ? json(e.status, { error: e.message })
      : json(503, {
          error:
            "Your submission could not be confirmed. Keep the form open and try again.",
        });
  }
}
