"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/app-shell";
import FirebaseRouteGuard from "@/components/firebase-route-guard";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import useUserRole from "@/hooks/use-user-role";

export default function PrescriptionLogsPage() {
  const { firebaseUser } = useFirebaseAuth();
  const userEmail = firebaseUser?.email ?? "Unknown user";
  const { role, isRoleLoading } = useUserRole();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      if (isRoleLoading || !userEmail || userEmail === "Unknown user") return;
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(
          `/api/prescriptions/logs?role=${encodeURIComponent(role)}&email=${encodeURIComponent(userEmail)}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          throw new Error(errorJson?.detail || errorJson?.message || "Unable to load prescription logs.");
        }
        const responseJson = await response.json();
        setLogs(Array.isArray(responseJson?.logs) ? responseJson.logs : []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load prescription logs.");
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, [isRoleLoading, role, userEmail]);

  return (
    <FirebaseRouteGuard callbackPath="/prescription/logs">
      <AppShell role={role} email={userEmail}>
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* Page header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
              Records
            </p>
            <h1
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              className="mt-1 text-3xl font-normal text-slate-900 md:text-4xl"
            >
              Prescription logs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Historical prescriptions synced from Airtable, including consult status and PDF links.
            </p>
          </div>

          {/* Table card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#0033CC]" />
                <p className="text-sm text-slate-400">Loading logs…</p>
              </div>
            ) : loadError ? (
              <div className="flex items-start gap-2 mx-6 my-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-xs text-red-600">{loadError}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-300">
                  ◻
                </div>
                <p className="text-sm font-semibold text-slate-500">No logs yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Completed prescriptions will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["Transaction", "Created at", "Patient", "Drug", "Dose", "Status", "PDF"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((logItem) => (
                      <tr
                        key={logItem.recordId}
                        className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-medium text-slate-700">
                          {logItem.transactionId || "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {logItem.createdAt || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {logItem.patientName || "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {logItem.patientAge || "—"} / {logItem.patientSex || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {logItem.drugName || "—"}
                          </p>
                          <p className="text-xs text-slate-400">{logItem.drugDosage || "—"}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {logItem.dosePerIntake || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#E6ECFF] px-2.5 py-1 text-xs font-semibold text-[#0033CC]">
                            {logItem.syncStatus || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {logItem.pdfUrl ? (
                            <a
                              href={logItem.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[#0033CC] underline underline-offset-2 hover:text-[#0029A3]"
                            >
                              View PDF →
                            </a>
                          ) : (
                            <span className="text-xs text-slate-300">No file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </AppShell>
    </FirebaseRouteGuard>
  );
}