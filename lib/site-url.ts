import { headers } from "next/headers";

/** URL publique du site (sans slash final). */
export async function getSiteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const proto = headersList.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

export function getSiteOriginFromRequest(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const { origin } = new URL(request.url);
  return origin;
}
