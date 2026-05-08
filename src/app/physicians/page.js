"use client";

import AppShell from "@/components/app-shell";
import FirebaseRouteGuard from "@/components/firebase-route-guard";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import provisionPhysicianAuthAccount from "@/lib/provision-physician-auth-account";
import useUserRole from "@/hooks/use-user-role";
import { useState } from "react";

export default function PhysiciansPage() {
  const { firebaseUser } = useFirebaseAuth();
  const { role } = useUserRole();
  const userEmail = firebaseUser?.email ?? "Unknown user";
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("Female");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [ptrNumber, setPtrNumber] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [sendResetLink, setSendResetLink] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const signatureBase64 = signatureFile
        ? await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
              const resultValue = typeof fileReader.result === "string" ? fileReader.result : "";
              const base64Value = resultValue.includes(",") ? resultValue.split(",")[1] : resultValue;
              resolve(base64Value);
            };
            fileReader.onerror = () => reject(new Error("Unable to read signature file."));
            fileReader.readAsDataURL(signatureFile);
          })
        : "";

      const authProvisionResult = await provisionPhysicianAuthAccount({
        email,
        temporaryPassword,
        sendResetLink,
      });

      const response = await fetch("/api/physicians/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: { email, fullName, sex, licenseNumber, ptrNumber },
          signatureBase64,
          signatureFileName: signatureFile?.name ?? "",
          signatureContentType: signatureFile?.type ?? "",
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson?.detail || errorJson?.message || "Unable to save physician.");
      }

      setStatusTone("success");
      setStatusMessage(
        authProvisionResult.status === "already_exists"
          ? "Physician auth account already exists. Airtable record updated and reset link sent."
          : "Physician record saved. Auth account created and ready for login.",
      );
      setEmail("");
      setFullName("");
      setSex("Female");
      setLicenseNumber("");
      setPtrNumber("");
      setSignatureFile(null);
      setTemporaryPassword("");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Unable to save physician.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10";

  return (
    <FirebaseRouteGuard callbackPath="/physicians">
      <AppShell role={role} email={userEmail}>
        {role !== "MedStaff" ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-500">Access denied</p>
            <h1
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              className="mt-2 text-2xl font-normal text-slate-900"
            >
              Restricted area
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Only MedStaff accounts can create physician records.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-6">

            {/* Page header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
                Physicians
              </p>
              <h1
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                className="mt-1 text-3xl font-normal text-slate-900 md:text-4xl"
              >
                Add physician
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Register a new prescribing doctor with credentials and signature.
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
              <form onSubmit={onSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Physician email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@clinic.com"
                    className={inputClass}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Full name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Maria Santos"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Sex */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </div>

                {/* License + PTR side by side */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      License number
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="LIC-12345"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      PTR number
                    </label>
                    <input
                      type="text"
                      value={ptrNumber}
                      onChange={(e) => setPtrNumber(e.target.value)}
                      placeholder="PTR-67890"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Temporary password */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Temporary password
                  </label>
                  <input
                    type="password"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="TempPass123!"
                    className={inputClass}
                    autoComplete="new-password"
                    required
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Physician can use this to sign in initially.
                  </p>
                </div>

                {/* Reset link option */}
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={sendResetLink}
                    onChange={(e) => setSendResetLink(e.target.checked)}
                  />
                  Send password reset email after provisioning
                </label>

                {/* Signature upload */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Signature attachment
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
                    className={inputClass}
                    required
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    PNG, JPG or WebP. Used on printed prescriptions.
                  </p>
                </div>

                {/* Status message */}
                {statusMessage && (
                  <div
                    className={`flex items-start gap-2 rounded-xl border px-4 py-3 ${
                      statusTone === "error"
                        ? "border-red-100 bg-red-50"
                        : "border-emerald-100 bg-emerald-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        statusTone === "error" ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    <p
                      className={`text-xs ${
                        statusTone === "error" ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <div className="border-t border-slate-100 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-colors hover:bg-[#D97400] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving…" : "Save physician →"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </AppShell>
    </FirebaseRouteGuard>
  );
}