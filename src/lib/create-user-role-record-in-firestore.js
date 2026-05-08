import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import firestoreDatabase from "@/lib/firebase-firestore-client";

export default async function createUserRoleRecordInFirestore({ userId, email, role }) {
  if (!firestoreDatabase) {
    throw new Error("Firestore is not initialized.");
  }

  const userDocumentReference = doc(firestoreDatabase, "users", userId);
  const nowIsoString = new Date().toISOString();

  await setDoc(
    userDocumentReference,
    {
      userId,
      email,
      role,
      createdAtIso: nowIsoString,
      updatedAtIso: nowIsoString,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
