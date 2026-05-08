"use client";

import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import { firebaseAuth } from "@/lib/firebase-auth-client";
import readFirebaseAuthErrorMessage from "@/lib/read-firebase-auth-error-message";
import Navbar from "@/components/navbar";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, isFirebaseConfigured } = useFirebaseAuth();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (firebaseUser) {
      router.replace(callbackUrl);
    }
  }, [callbackUrl, firebaseUser, router]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isFirebaseConfigured || !firebaseAuth) {
      setError("Firebase config missing. Add NEXT_PUBLIC_FIREBASE_* values to your .env file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.replace(callbackUrl);
    } catch (firebaseError) {
      setError(readFirebaseAuthErrorMessage(firebaseError, "Invalid email or password."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen bg-[#F7F6F2]"
    >
      <Navbar />

      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0033CC 1px, transparent 1px), linear-gradient(90deg, #0033CC 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Accent blob */}
      <div className="pointer-events-none fixed -left-32 top-1/3 h-96 w-96 rounded-full bg-[#E6ECFF] opacity-40" />
      <div className="pointer-events-none fixed -right-32 bottom-1/3 h-64 w-64 rounded-full bg-[#FFF3E0] opacity-40" />

      <main className="relative flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6ECFF]">
                <span className="h-3 w-3 rounded-full bg-[#0033CC]" />
              </div>
              <h1
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                className="text-2xl font-normal text-slate-900"
              >
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your Pilli account</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#FF8A00] py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-colors hover:bg-[#D97400] disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Continue →"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Sign up link */}
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Create an account
              </Link>
            </form>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by Pilli&apos;s clinical-grade security.{" "}
            <a href="#" className="underline underline-offset-2 hover:text-slate-600">
              Privacy policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}