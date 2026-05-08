"use client";

import { useContext } from "react";
import FirebaseAuthContext from "@/contexts/firebase-auth-context";

export default function useFirebaseAuth() {
  const firebaseAuthContextValue = useContext(FirebaseAuthContext);

  if (!firebaseAuthContextValue) {
    throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider.");
  }

  return firebaseAuthContextValue;
}
