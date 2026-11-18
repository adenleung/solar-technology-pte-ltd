import { env } from "cloudflare:workers";
import { reviewDrawing } from "@/lib/solar/reviewDrawing";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  return reviewDrawing(request, reference, env);
}
