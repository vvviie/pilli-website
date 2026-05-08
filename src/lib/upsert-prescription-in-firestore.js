import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import firestoreDatabase from "@/lib/firebase-firestore-client";

export default async function upsertPrescriptionInFirestore({ userId, transactionId, recordPayload }) {
  if (!firestoreDatabase) {
    throw new Error("Firestore is not initialized.");
  }
  if (!userId) {
    throw new Error("Missing user ID for Firestore write.");
  }

  const physicianPrescriptionDocumentReference = doc(
    firestoreDatabase,
    "physicians",
    userId,
    "prescriptions",
    transactionId,
  );
  const globalPrescriptionDocumentReference = doc(firestoreDatabase, "prescriptions", transactionId);
  const nowIso = new Date().toISOString();
  const basePayload = {
    ...recordPayload,
    firestoreDocumentId: transactionId,
    physicianUid: userId,
    updatedAt: serverTimestamp(),
    updatedAtIso: nowIso,
  };

  const writeBatchOperation = writeBatch(firestoreDatabase);
  writeBatchOperation.set(
    physicianPrescriptionDocumentReference,
    {
      ...basePayload,
      firestorePath: `physicians/${userId}/prescriptions/${transactionId}`,
    },
    { merge: true },
  );
  writeBatchOperation.set(
    globalPrescriptionDocumentReference,
    {
      ...basePayload,
      firestorePath: `prescriptions/${transactionId}`,
      physicianPrescriptionPath: `physicians/${userId}/prescriptions/${transactionId}`,
    },
    { merge: true },
  );
  await writeBatchOperation.commit();

  return transactionId;
}
