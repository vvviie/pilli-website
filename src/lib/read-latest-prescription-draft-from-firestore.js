import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import firestoreDatabase from "@/lib/firebase-firestore-client";

export default async function readLatestPrescriptionDraftFromFirestore({ userId }) {
  if (!firestoreDatabase || !userId) {
    return null;
  }

  const prescriptionsCollectionReference = collection(
    firestoreDatabase,
    "physicians",
    userId,
    "prescriptions",
  );
  const prescriptionsQuery = query(
    prescriptionsCollectionReference,
    orderBy("updatedAtIso", "desc"),
    limit(25),
  );
  const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
  const latestDraftDocument = prescriptionsSnapshot.docs.find(
    (documentSnapshot) => documentSnapshot.data()?.status === "draft",
  );

  if (!latestDraftDocument) {
    return null;
  }

  return {
    transactionId: latestDraftDocument.id,
    ...latestDraftDocument.data(),
  };
}
