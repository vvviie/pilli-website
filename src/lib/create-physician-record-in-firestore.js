import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import firestoreDatabase from "@/lib/firebase-firestore-client";

export default async function createPhysicianRecordInFirestore({ userId, email }) {
  if (!firestoreDatabase) {
    throw new Error("Firestore is not initialized.");
  }

  const physicianDocumentReference = doc(firestoreDatabase, "physicians", userId);
  const nowIsoString = new Date().toISOString();

  await setDoc(
    physicianDocumentReference,
    {
      email,
      licenseNumber: "",
      ptrNumber: "",
      signatureUrl: "",
      role: "Physician",
      createdAtIso: nowIsoString,
      updatedAtIso: nowIsoString,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
