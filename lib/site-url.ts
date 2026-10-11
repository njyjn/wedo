import "server-only";
import { headers } from "next/headers";

/** Absolute origin for links that leave the site (QR codes, copied RSVP text). */
export async function siteUrl(): Promise<string> {
  if (process.env.APP_BASE_URL)
    return process.env.APP_BASE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
