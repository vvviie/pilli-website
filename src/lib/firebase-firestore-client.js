import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase-client";

const firestoreDatabase = firebaseApp ? getFirestore(firebaseApp) : null;

export default firestoreDatabase;
