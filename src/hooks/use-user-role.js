"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import firestoreDatabase from "@/lib/firebase-firestore-client";

export default function useUserRole() {
  const { firebaseUser } = useFirebaseAuth();
  const [role, setRole] = useState("Physician");
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const readUserRole = async () => {
      if (!firebaseUser?.uid || !firestoreDatabase) {
        setRole("Physician");
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);
      try {
        const userDocumentReference = doc(firestoreDatabase, "users", firebaseUser.uid);
        const userDocumentSnapshot = await getDoc(userDocumentReference);
        const firestoreRole = userDocumentSnapshot.data()?.role;
        if (typeof firestoreRole === "string" && firestoreRole.length > 0) {
          setRole(firestoreRole);
        } else {
          setRole("Physician");
        }
      } catch {
        setRole("Physician");
      } finally {
        setIsRoleLoading(false);
      }
    };

    readUserRole();
  }, [firebaseUser?.uid]);

  return { role, isRoleLoading };
}
