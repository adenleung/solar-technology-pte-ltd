import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import test from "node:test";
import { receiveEnquiry } from "../lib/solar/receiveEnquiry.ts";
import { DEFAULT_PLAN } from "../components/solar/planner/plannerModel.ts";
import { MAX_REQUEST_BYTES } from "../lib/solar/quote.ts";

function fixture() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(
    readFileSync(
      new URL("../drizzle/0000_premium_ted_forrester.sql", import.meta.url),
      "utf8",
    ),
  );
  const DB = {
    prepare(q) {
      const stmt = sql.prepare(q);
      return {
        bind(...args) {
          return {
            first: async () => stmt.get(...args),
            run: async () => stmt.run(...args),
          };
        },
      };
    },
  };
  const files = new Map();
  const BUCKET = {
    put: async (key, bytes, metadata) => {
      files.set(key, { bytes, metadata });
    },
  };
  return { sql, files, bindings: { DB, BUCKET } };
}
const url = "https://preview.invalid/api/enquiries";
function fields() {
  return {
    id: crypto.randomUUID(),
    name: "QA",
    company: "",
    email: "qa@example.invalid",
    phone: "",
    location: "Test roof",
    buildingType: "Residential",
    roof: "Pitched",
    interest: "SP-N16B/96HG",
    requirements: "Local test",
    consent: "yes",
    website: "",
  };
}
function request(values, headers = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return new Request(url, {
    method: "POST",
    headers: { origin: "https://preview.invalid", ...headers },
    body: data,
  });
}
test("saved enquiry includes server-calculated layout and stable retry reference", async () => {
  const { sql, bindings } = fixture();
  const input = {
    ...fields(),
    configuration: JSON.stringify({ ...DEFAULT_PLAN, capacityKw: 9999 }),
  };
  const first = await receiveEnquiry(request(input), bindings);
  assert.equal(first.status, 201);
  const receipt = await first.json();
  assert.match(receipt.reference, /^ST-[A-F0-9]{12}$/);
  const duplicate = await receiveEnquiry(request(input), bindings);
  assert.deepEqual(await duplicate.json(), receipt);
  const row = sql.prepare("select * from enquiries").get();
  assert.equal(row.status, "received");
  assert.equal(JSON.parse(row.configuration).estimate.capacityKwp, 18);
  assert.equal(sql.prepare("select count(*) as n from enquiries").get().n, 1);
  assert.equal(
    (
      await receiveEnquiry(
        request({ ...input, location: "Elsewhere" }),
        bindings,
      )
    ).status,
    409,
  );
});
test("invalid or cross-origin entries never create a record", async () => {
  const { sql, bindings } = fixture();
  for (const change of [
    { email: "bad" },
    { consent: "" },
    { website: "bot field" },
    { name: "" },
    { configuration: "[" },
    { configuration: JSON.stringify({ ...DEFAULT_PLAN, roofArea: -5 }) },
  ])
    assert.equal(
      (await receiveEnquiry(request({ ...fields(), ...change }), bindings))
        .status,
      422,
    );
  assert.equal(
    (
      await receiveEnquiry(
        request(fields(), { origin: "https://unrelated.invalid" }),
        bindings,
      )
    ).status,
    403,
  );
  assert.equal(sql.prepare("select count(*) as n from enquiries").get().n, 0);
});
test("private drawing write may be safely retried after storage interruption", async () => {
  const { sql, bindings, files } = fixture();
  const file = new File(["%PDF-1.5\nTest drawing\n%%EOF"], "example.pdf", {
    type: "application/pdf",
  });
  const data = { ...fields(), drawing: file };
  let attempts = 0;
  const real = bindings.BUCKET.put;
  bindings.BUCKET.put = async (...args) => {
    if (attempts++ === 0) throw Error("storage unavailable");
    await real(...args);
  };
  assert.equal((await receiveEnquiry(request(data), bindings)).status, 503);
  assert.equal(
    sql.prepare("select status from enquiries").get().status,
    "awaiting_drawing",
  );
  assert.equal((await receiveEnquiry(request(data), bindings)).status, 201);
  const row = sql.prepare("select * from enquiries").get();
  assert.equal(row.status, "received");
  assert.equal(
    files.get(row.drawing_key).metadata.httpMetadata.contentType,
    "application/pdf",
  );
  assert.equal((await receiveEnquiry(request(data), bindings)).status, 201);
  assert.equal(attempts, 2);
});
test("file type, body size, missing storage and invalid request encodings get explicit errors", async () => {
  const { bindings } = fixture();
  const fake = new File(["plain text"], "drawing.png", { type: "image/png" });
  assert.equal(
    (await receiveEnquiry(request({ ...fields(), drawing: fake }), bindings))
      .status,
    422,
  );
  assert.equal(
    (
      await receiveEnquiry(
        request(fields(), { "content-length": String(MAX_REQUEST_BYTES + 1) }),
        bindings,
      )
    ).status,
    413,
  );
  assert.equal((await receiveEnquiry(request(fields()), {})).status, 503);
  assert.equal(
    (
      await receiveEnquiry(
        new Request(url, { method: "POST", body: "{}" }),
        bindings,
      )
    ).status,
    415,
  );
});
test("hourly submission limit allows a receipt lookup after the limit", async () => {
  const { bindings } = fixture(),
    original = fields();
  await receiveEnquiry(request(original), bindings);
  for (let i = 1; i < 12; i++)
    assert.equal(
      (await receiveEnquiry(request(fields()), bindings)).status,
      201,
    );
  assert.equal((await receiveEnquiry(request(fields()), bindings)).status, 429);
  assert.equal((await receiveEnquiry(request(original), bindings)).status, 201);
});
test("simultaneous identical requests converge on one saved enquiry", async () => {
  const { sql, bindings } = fixture(),
    data = fields();
  const out = await Promise.all([
    receiveEnquiry(request(data), bindings),
    receiveEnquiry(request(data), bindings),
  ]);
  const receipts = await Promise.all(out.map((x) => x.json()));
  assert.deepEqual(receipts[0], receipts[1]);
  assert.equal(sql.prepare("select count(*) as n from enquiries").get().n, 1);
});

test("a private enquiry key retrieves only its own completed drawing", async () => {
  const { reviewDrawing } = await import("../lib/solar/reviewDrawing.ts");
  const { sql, bindings, files } = fixture(),
    file = new File(["%PDF-1.5\nQA document\n%%EOF"], "project plan.pdf", {
      type: "application/pdf",
    });
  bindings.BUCKET.get = async (key) =>
    files.has(key) ? { body: files.get(key).bytes } : null;
  const response = await receiveEnquiry(
    request({ ...fields(), drawing: file }),
    bindings,
  );
  const { reference } = await response.json(),
    row = sql.prepare("select drawing_key from enquiries").get();
  assert.ok(row.drawing_key.length > 70);
  const fetchFile = (ref, key) =>
    reviewDrawing(
      new Request(url, {
        headers: key ? { Authorization: "Bearer " + key } : {},
      }),
      ref,
      bindings,
    );
  assert.equal((await fetchFile(reference)).status, 404);
  assert.equal((await fetchFile(reference, "unrelated")).status, 404);
  assert.equal(
    (await fetchFile("ST-FFFFFFFFFFFF", row.drawing_key)).status,
    404,
  );
  const ok = await fetchFile(reference, row.drawing_key);
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-disposition"), /project%20plan.pdf/);
  assert.match(await ok.text(), /^%PDF/);
});
