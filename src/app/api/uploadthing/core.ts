import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

function getAdminApp() {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("Firebase Admin is not configured.");
  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY is not valid JSON.");
  }
  return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
}

async function requireCustomerUid(request: Request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error("Sign in to upload a customer photo.");
  const decoded = await getAuth(getAdminApp()).verifyIdToken(match[1]);
  if (!decoded.uid) throw new Error("Customer identity could not be verified.");
  return decoded.uid;
}

export const ourFileRouter = {
  customerStyleImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const customerId = await requireCustomerUid(req);
      return { customerId };
    })
    .onUploadComplete(async ({ metadata, file }) => ({
      customerId: metadata.customerId,
      imageUrl: file.ufsUrl || file.url,
      imageKey: file.key,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
