import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#F7F6F2]/90 backdrop-blur-sm"
    >
      <div className="flex w-full items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0033CC]" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">Pilli</span>
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-[#0033CC] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0029A3] transition-colors"
        >
          Sign in →
        </Link>
      </div>
    </header>
  );
}