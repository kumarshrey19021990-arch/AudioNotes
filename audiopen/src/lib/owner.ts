import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const OWNER_COOKIE = "audiopen_owner";

export async function getOwnerKeyFromCookies(): Promise<string> {
  const jar = await cookies();
  const v = jar.get(OWNER_COOKIE)?.value;
  if (!v) {
    // middleware should always set this; if not, fail loudly.
    throw new Error("Missing owner cookie.");
  }
  return v;
}

export function getOwnerKeyFromRequest(req: Request | NextRequest): string {
  // NextRequest has `.cookies`, Request doesn't. Use headers fallback.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyReq = req as any;
  const direct = anyReq?.cookies?.get?.(OWNER_COOKIE)?.value;
  if (direct) return direct;

  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((p) => p.startsWith(`${OWNER_COOKIE}=`));
  const v = match?.split("=").slice(1).join("=") ?? "";
  if (!v) throw new Error("Missing owner cookie.");
  return decodeURIComponent(v);
}

