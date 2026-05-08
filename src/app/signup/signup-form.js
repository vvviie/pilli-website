"use client";

import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import createUserRoleRecordInFirestore from "@/lib/create-user-role-record-in-firestore";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import { firebaseAuth } from "@/lib/firebase-auth-client";
import readFirebaseAuthErrorMessage from "@/lib/read-firebase-auth-error-message";
import readPasswordValidationError from "@/lib/read-password-validation-error";
import Navbar from "@/components/navbar";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, isFirebaseConfigured } = useFirebaseAuth();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordValidationError = readPasswordValidationError(password, confirmPassword);
  const canSubmitForm =
    Boolean(email) && Boolean(password) && Boolean(confirmPassword) && !passwordValidationError;

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

    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await createUserRoleRecordInFirestore({
        userId: userCredential.user.uid,
        email: userCredential.user.email ?? email,
        role: "MedStaff",
      });
      router.replace(callbackUrl);
    } catch (firebaseError) {
      setError(
        readFirebaseAuthErrorMessage(
          firebaseError,
          "Unable to create account. Please check your details and try again.",
        ),
      );
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
      {/* Accent blobs */}
      <div className="pointer-events-none fixed -right-32 top-1/4 h-96 w-96 rounded-full bg-[#E6ECFF] opacity-40" />
      <div className="pointer-events-none fixed -left-32 bottom-1/4 h-64 w-64 rounded-full bg-[#FFF3E0] opacity-40" />

      <main className="relative flex min-h-[calc(100vh-65px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3E0]">
                <span className="h-3 w-3 rounded-full bg-[#FF8A00]" />
              </div>
              <h1
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                className="text-2xl font-normal text-slate-900"
              >
                Create an account
              </h1>
              <p className="mt-1 text-sm text-slate-500">Join Pilli as a MedStaff member</p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
              {/* Designation (read-only) */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Designation
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
                  <span className="text-sm font-medium text-slate-500">MedStaff</span>
                  <span className="ml-auto rounded-full bg-[#E6ECFF] px-2.5 py-0.5 text-xs font-semibold text-[#0033CC]">
                    Default
                  </span>
                </div>
              </div>

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
                  autoComplete="new-password"
                  required
                />
                {/* Inline password hint */}
                {password && passwordValidationError && !confirmPassword && (
                  <p className="mt-1.5 text-xs text-amber-600">{passwordValidationError}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10"
                  autoComplete="new-password"
                  required
                />
                {/* Match indicator */}
                {confirmPassword && (
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      passwordValidationError ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {passwordValidationError ? passwordValidationError : "✓ Passwords match"}
                  </p>
                )}
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
                disabled={isSubmitting || !canSubmitForm}
                className="w-full rounded-xl bg-[#FF8A00] py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-colors hover:bg-[#D97400] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating account…" : "Create account →"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-xs text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Login link */}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                Back to sign in
              </Link>
            </form>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-slate-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-slate-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}