import { createHash, timingSafeEqual } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("Server configuration is missing FIREBASE_ADMIN_KEY.");
  let serviceAccount: Record<string, unknown>;
  try { serviceAccount = JSON.parse(raw) as Record<string, unknown>; }
  catch { throw new Error("FIREBASE_ADMIN_KEY must contain service-account JSON."); }
  if (typeof serviceAccount.private_key === "string") serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}

function matchesAccessWord(input: string, expected: string) {
  const actualDigest = createHash("sha256").update(input).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return input.length > 0 && timingSafeEqual(actualDigest, expectedDigest);
}

export async function POST(request: Request) {
  try {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return NextResponse.json(
      { error: "One-word admin access is not configured. Set ADMIN_PASSWORD in the server environment." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );

    const body = await request.json().catch(() => null) as { word?: unknown } | null;
    const word = typeof body?.word === "string" ? body.word : "";
    if (!matchesAccessWord(word, expected)) return NextResponse.json(
      { error: "Access denied. Check the access word and try again." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );

    const app = getAdminApp();
    const uid = "jts-one-word-admin";
    const db = getFirestore(app);
    const adminRef = db.collection("admins").doc(uid);
    const existing = await adminRef.get();
    if (!existing.exists) {
      await adminRef.set({ role: "owner", temporaryAccess: true, accessMethod: "one-word-admin", createdAt: new Date().toISOString() });
    } else if (!["owner", "staff"].includes(String(existing.data()?.role ?? "").toLowerCase())) {
      return NextResponse.json(
        { error: "This access account is not authorized for JTS Operations." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    const token = await getAuth(app).createCustomToken(uid);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("[JTS] One-word admin sign-in failed:", message);
    const configured = /FIREBASE_ADMIN_KEY|service-account JSON/.test(message);
    return NextResponse.json(
      { error: configured ? "Server admin credentials are missing or invalid. Configure FIREBASE_ADMIN_KEY." : "Admin sign-in is temporarily unavailable. Check the server configuration." },
      { status: configured ? 503 : 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
