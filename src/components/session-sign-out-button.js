"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase-auth-client";

export default function SessionSignOutButton({ className }) {
  const router = useRouter();

  const onSignOut = async () => {
    if (firebaseAuth) {
      await signOut(firebaseAuth);
    }
    router.push("/login");
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${className ?? ""}`}
    >
      Sign out
    </button>
  );
}
