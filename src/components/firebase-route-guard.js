"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useFirebaseAuth from "@/hooks/use-firebase-auth";

function FullScreenState({ message, showSpinner = false }) {
  return (
    <main
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="flex min-h-screen items-center justify-center bg-[#F7F6F2] px-4"
    >
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0033CC 1px, transparent 1px), linear-gradient(90deg, #0033CC 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative w-full max-w-xs text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          {showSpinner ? (
            <span
              className="block h-5 w-5 rounded-full border-2 border-[#0033CC]/20 border-t-[#0033CC]"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-[#0033CC]" />
          )}
        </div>
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        <p className="mt-1 text-xs text-slate-400">Pilli Clinical Portal</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}

export default function FirebaseRouteGuard({ children, callbackPath }) {
  const router = useRouter();
  const { firebaseUser, isFirebaseAuthReady, isFirebaseConfigured } = useFirebaseAuth();

  useEffect(() => {
    if (!isFirebaseAuthReady) return;
    if (!isFirebaseConfigured) {
      router.replace("/login");
      return;
    }
    if (!firebaseUser) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
    }
  }, [callbackPath, firebaseUser, isFirebaseAuthReady, isFirebaseConfigured, router]);

  if (!isFirebaseAuthReady) {
    return <FullScreenState message="Checking session…" showSpinner />;
  }

  if (!isFirebaseConfigured || !firebaseUser) {
    return <FullScreenState message="Redirecting to login…" showSpinner />;
  }

  return children;
}