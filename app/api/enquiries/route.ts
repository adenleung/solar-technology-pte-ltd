import { env } from "cloudflare:workers";
import { receiveEnquiry } from "@/lib/solar/receiveEnquiry";
export function POST(request: Request) {
  return receiveEnquiry(request, env);
}
