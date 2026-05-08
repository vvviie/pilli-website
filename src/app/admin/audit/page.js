"use client";

import Link from "next/link";
import AppShell from "@/components/app-shell";
import FirebaseRouteGuard from "@/components/firebase-route-guard";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import useUserRole from "@/hooks/use-user-role";

export default function AdminAuditPage() {
  const { firebaseUser } = useFirebaseAuth();
  const userEmail = firebaseUser?.email ?? "Unknown user";
  const { role } = useUserRole();

  return (
    <FirebaseRouteGuard callbackPath="/admin/audit">
      <AppShell role={role} email={userEmail}>
        {role !== "Admin" ? (
          <div className="mx-auto max-w-2xl rounded-card bg-white p-8 shadow-card">
            <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
            <p className="mt-2 text-sm text-slate-600">Admin role required to view audit logs.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-primary">
              Return to dashboard
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-4 rounded-card bg-white p-8 shadow-card">
            <h1 className="text-2xl font-bold text-slate-900">Audit log</h1>
            <p className="text-sm text-slate-600">
              Airtable-backed audit table wiring will populate this view. Filters stub per OpenSpec tasks.
            </p>
            <Link href="/dashboard" className="text-sm font-semibold text-brand-primary hover:underline">
              Back to dashboard
            </Link>
          </div>
        )}
      </AppShell>
    </FirebaseRouteGuard>
  );
}
