import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail } from "firebase/auth";

const readFirebaseConfig = () => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

export default async function provisionPhysicianAuthAccount({
  email,
  temporaryPassword,
  sendResetLink,
}) {
  const secondaryApp = initializeApp(readFirebaseConfig(), `physician-provisioning-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    await createUserWithEmailAndPassword(secondaryAuth, email, temporaryPassword);
    if (sendResetLink) {
      await sendPasswordResetEmail(secondaryAuth, email);
    }
    return { status: "created" };
  } catch (error) {
    const errorCode = String(error?.code ?? "");
    if (errorCode === "auth/email-already-in-use") {
      if (sendResetLink) {
        await sendPasswordResetEmail(secondaryAuth, email);
      }
      return { status: "already_exists" };
    }

    if (errorCode === "auth/invalid-email") {
      throw new Error("Invalid physician email for auth account.");
    }

    if (errorCode === "auth/weak-password") {
      throw new Error("Temporary password is too weak. Use at least 8 characters.");
    }

    throw new Error("Unable to provision physician auth account.");
  } finally {
    await deleteApp(secondaryApp);
  }
}
