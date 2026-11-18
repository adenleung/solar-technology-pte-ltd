/** The private enquiry row holds a per-file capability. A public receipt alone gives no access. */
export async function reviewDrawing(
  request: Request,
  reference: string,
  bindings: { DB?: D1Database; BUCKET?: R2Bucket },
): Promise<Response> {
  const unavailable = () =>
    new Response(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  const auth = request.headers.get("authorization");
  if (
    !/^ST-[A-F0-9]{12}$/.test(reference) ||
    !auth?.startsWith("Bearer ") ||
    auth.length > 220
  )
    return unavailable();
  if (!bindings.DB || !bindings.BUCKET)
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  const key = auth.slice(7);
  const row = await bindings.DB.prepare(
    "SELECT drawing_name FROM enquiries WHERE reference=? AND drawing_key=? AND status='received'",
  )
    .bind(reference, key)
    .first<{ drawing_name: string }>();
  if (!row) return unavailable();
  const object = await bindings.BUCKET.get(key);
  if (!object) return unavailable();
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "sandbox",
    "Content-Type": "application/octet-stream",
  });
  const safeName = encodeURIComponent(row.drawing_name || "drawing").replace(
    /['()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16),
  );
  headers.set(
    "Content-Disposition",
    "attachment; filename*=UTF-8''" + safeName,
  );
  return new Response(object.body, { headers });
}
