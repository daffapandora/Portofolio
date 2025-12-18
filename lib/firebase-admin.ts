import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK for server-side operations
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const adminApp: App = getApps().length ? getApps()[0] : initializeApp({
  credential: cert(serviceAccount as Parameters<typeof cert>[0]),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const auth: Auth = getAuth(adminApp);
const db: Firestore = getFirestore(adminApp);
const storage: Storage = getStorage(adminApp);

export { adminApp, auth as adminAuth, db as adminDb, storage as adminStorage };

// Server-side helper functions
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const user = await auth.getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function setAdminRole(uid: string): Promise<void> {
  await auth.setCustomUserClaims(uid, { admin: true });
}
