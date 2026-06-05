import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
  // If FIREBASE_SERVICE_ACCOUNT is provided in .env (as a JSON string), use it.
  // Otherwise, fallback to application default credentials.
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (!admin.apps.length) {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp({
      projectId: "mkhe-auth",
    });
  }
  console.log("🔥 Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error);
}

export const adminAuth = admin.auth();
export default admin;
