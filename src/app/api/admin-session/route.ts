import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const APPROVED_ADMIN_ROLES = new Map([
  ["gatshaayanda@gmail.com", "owner"],
  ["chikohoraknowledge4@gmail.com", "staff"],
]);

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("FIREBASE_ADMIN_KEY is not configured.");
  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY is not valid JSON.");
  }
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}

export async function POST(request: Request) {
  const match = (request.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: "Sign in with an approved Google account, then try again." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const app = getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(match[1]);
    const email = String(decoded.email || "").trim().toLowerCase();
    const defaultRole = APPROVED_ADMIN_ROLES.get(email);
    if (decoded.email_verified !== true || !defaultRole) {
      return NextResponse.json({ error: "This Google account is not approved for JTS Operations." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const adminRef = getFirestore(app).collection("admins").doc(decoded.uid);
    const existing = await adminRef.get();
    const existingRole = String(existing.data()?.role || "").toLowerCase();
    if (existing.exists && !["owner", "staff"].includes(existingRole)) {
      return NextResponse.json({ error: "This account does not have an active JTS owner/staff role." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }

    const now = new Date().toISOString();
    await adminRef.set(existing.exists
      ? { accessMethod: "approved-google", lastAccessAt: now }
      : { role: defaultRole, accessMethod: "approved-google", createdAt: now, lastAccessAt: now },
      { merge: true });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const configError = /FIREBASE_ADMIN_KEY|service account|private key|credential/i.test(message);
    console.error("[JTS] Approved admin session could not be provisioned.", { configError });
    return NextResponse.json(
      { error: configError ? "Admin access is not configured on the server. Check the Firebase Admin environment setting." : "JTS could not verify this admin session. Try again or use the one-word Enter access." },
      { status: configError ? 503 : 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
