"use client";

import Link from "next/link";
import AppShell from "@/components/app-shell";
import FirebaseRouteGuard from "@/components/firebase-route-guard";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import useUserRole from "@/hooks/use-user-role";

const quickActions = (role) => [
  {
    href: "/prescription",
    label: "New prescription",
    description: "Draft and issue a clinical script",
    icon: "⊕",
    variant: "orange",
    always: true,
  },
  {
    href: "/physicians",
    label: "Add physician",
    description: "Register a new prescribing doctor",
    icon: "◈",
    variant: "blue",
    always: false,
    showFor: ["MedStaff"],
  },
  {
    href: "/prescription/logs",
    label: "Prescription logs",
    description: "Review all issued prescriptions",
    icon: "◻",
    variant: "ghost",
    always: true,
  },
  {
    href: "/admin/audit",
    label: "Audit log",
    description: "Full system activity trail",
    icon: "⊞",
    variant: "ghost",
    always: false,
    showFor: ["Admin"],
  },
].filter((a) => a.always || a.showFor?.includes(role));

export default function DashboardPage() {
  const { firebaseUser } = useFirebaseAuth();
  const userEmail = firebaseUser?.email ?? "Unknown user";
  const { role } = useUserRole();
  const actions = quickActions(role);
  const initials = userEmail?.[0]?.toUpperCase() ?? "?";

  return (
    <FirebaseRouteGuard callbackPath="/dashboard">
      <AppShell role={role} email={userEmail}>
        <div className="mx-auto max-w-4xl space-y-8">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
                Overview
              </p>
              <h1
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                className="mt-1 text-3xl font-normal text-slate-900 md:text-4xl"
              >
                Welcome back
              </h1>
            </div>
            {/* User badge */}
            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6ECFF] text-xs font-bold text-[#0033CC]">
                {initials}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 max-w-[160px] truncate">{userEmail}</p>
                <span className="text-[10px] font-medium text-slate-400">{role}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Scripts today", value: "—" },
              { label: "Pending review", value: "—" },
              { label: "Physicians", value: "—" },
              { label: "Audit events", value: "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-0.5 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions grid */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Quick actions
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 transition-all ${
                    action.variant === "orange"
                      ? "border-[#FF8A00]/20 bg-[#FFF8F0] hover:border-[#FF8A00]/40 hover:bg-[#FFF3E0]"
                      : action.variant === "blue"
                      ? "border-[#0033CC]/15 bg-[#E6ECFF] hover:border-[#0033CC]/30 hover:bg-[#D6E0FF]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                      action.variant === "orange"
                        ? "bg-[#FF8A00]/10 text-[#FF8A00]"
                        : action.variant === "blue"
                        ? "bg-[#0033CC]/10 text-[#0033CC]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        action.variant === "orange"
                          ? "text-[#D97400]"
                          : action.variant === "blue"
                          ? "text-[#0033CC]"
                          : "text-slate-800"
                      }`}
                    >
                      {action.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
                  </div>
                  <span
                    className={`text-lg transition-transform group-hover:translate-x-0.5 ${
                      action.variant === "orange"
                        ? "text-[#FF8A00]"
                        : action.variant === "blue"
                        ? "text-[#0033CC]"
                        : "text-slate-300"
                    }`}
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent activity placeholder */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Recent activity
            </p>
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-300">
                  ◻
                </div>
                <p className="text-sm font-semibold text-slate-500">No activity yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Prescriptions you issue will appear here
                </p>
                <Link
                  href="/prescription"
                  className="mt-5 rounded-full bg-[#FF8A00] px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-[#FF8A00]/20 hover:bg-[#D97400] transition-colors"
                >
                  Issue first script →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </AppShell>
    </FirebaseRouteGuard>
  );
}