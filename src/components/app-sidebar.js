"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SessionSignOutButton from "@/components/session-sign-out-button";

const navItems = (role) => [
  { href: "/dashboard", label: "Overview", icon: "▣" },
  { href: "/prescription", label: "New Prescription", icon: "⊕" },
  ...(role === "MedStaff" ? [{ href: "/physicians", label: "Physicians", icon: "◈" }] : []),
  { href: "/prescription/logs", label: "Prescription Logs", icon: "◻" },
  ...(role === "Admin" ? [{ href: "/admin/audit", label: "Audit Log", icon: "⊞" }] : []),
];

export default function AppSidebar({ role, email }) {
  const pathname = usePathname();
  const items = navItems(role);

  return (
    <aside
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="flex w-full flex-col border-r border-slate-200 bg-white lg:min-h-screen lg:w-64"
    >
      {/* Logo */}
      <div className="border-b border-slate-100 px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0033CC]" />
          <span className="text-sm font-bold tracking-tight text-slate-900">Pilli</span>
        </Link>
      </div>

      {/* User identity card */}
      <div className="px-4 py-4">
        <div className="rounded-xl border border-slate-100 bg-[#F7F6F2] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6ECFF] text-xs font-bold text-[#0033CC]">
              {email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{email}</p>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#E6ECFF] px-2 py-0.5 text-[10px] font-semibold text-[#0033CC]">
                <span className="h-1 w-1 rounded-full bg-[#0033CC]" />
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Navigation
        </p>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#E6ECFF] text-[#0033CC]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`text-base ${active ? "text-[#0033CC]" : "text-slate-400"}`}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick actions */}
      <div className="px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Quick actions
        </p>
        <div className="space-y-2">
          <Link
            href="/prescription"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#FF8A00]/20 transition-colors hover:bg-[#D97400]"
          >
            <span className="text-base leading-none">⊕</span>
            Issue new script
          </Link>
          <Link
            href="/prescription?csv=1"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <span className="text-base leading-none">⤓</span>
            Upload CSV
          </Link>
          {role === "MedStaff" && (
            <Link
              href="/physicians"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#0033CC]/20 bg-[#E6ECFF] px-4 py-2.5 text-xs font-semibold text-[#0033CC] transition-colors hover:bg-[#D6E0FF]"
            >
              <span className="text-base leading-none">◈</span>
              Add physician
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-3">
        <div className="mt-1">
          <SessionSignOutButton />
        </div>
      </div>
    </aside>
  );
}