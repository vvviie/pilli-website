import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase-client";

const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export { firebaseAuth };
