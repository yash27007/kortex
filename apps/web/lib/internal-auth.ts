import { NextRequest, NextResponse } from "next/server";

/**
 * Guards routes that exist only for apps/core (the Python backend) to call
 * back into Next.js — course structure persistence, lesson content updates.
 * These are never called from the browser, so a shared secret (not Clerk,
 * not the admin session) is the right amount of auth: it just needs to keep
 * randoms off routes that write arbitrary content into the database.
 *
 * Returns a NextResponse to return immediately if unauthorized, or null if
 * the request is authorized and the caller should proceed.
 */
export function verifyInternalSecret(request: NextRequest): NextResponse | null {
  const expected = process.env.INTERNAL_API_SECRET;

  if (!expected) {
    console.error("[internal-auth] INTERNAL_API_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const provided = request.headers.get("x-internal-secret");

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
