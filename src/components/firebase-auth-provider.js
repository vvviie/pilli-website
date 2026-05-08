"use client";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import FirebaseAuthContext from "@/contexts/firebase-auth-context";
import { firebaseAuth } from "@/lib/firebase-auth-client";
import { hasFirebaseConfig } from "@/lib/firebase-client";

export default function FirebaseAuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsFirebaseAuthReady(true);
      return () => undefined;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setFirebaseUser(nextUser);
      setIsFirebaseAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const contextValue = useMemo(
    () => ({
      firebaseUser,
      isFirebaseAuthReady,
      isFirebaseConfigured: hasFirebaseConfig,
    }),
    [firebaseUser, isFirebaseAuthReady],
  );

  return <FirebaseAuthContext.Provider value={contextValue}>{children}</FirebaseAuthContext.Provider>;
}
