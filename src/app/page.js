import Link from "next/link";

const features = [
  {
    icon: "⊕",
    title: "Structured Signa",
    body: "Dosage, frequency, duration, and route captured with clinical-grade affordances. Zero ambiguity in every directive.",
  },
  {
    icon: "◻",
    title: "PDF + Signature",
    body: "Generate downloadable prescriptions with physician metadata, digital signing, and tamper-evident output.",
  },
  {
    icon: "⊞",
    title: "Airtable Profiles",
    body: "Server-side physician credentials with rate-limit aware retries and automatic refresh.",
  },
  {
    icon: "◈",
    title: "DPA-Minded Defaults",
    body: "Patient identifiers minimized in audit payloads. Compliant by default, extensible by policy.",
  },
];

const stats = [
  { value: "< 60s", label: "Avg. script time" },
  { value: "100%", label: "Audit coverage" },
  { value: "HIPAA", label: "Compliant defaults" },
];

export default function HomePage() {
  return (
    <main
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen bg-[#F7F6F2] text-slate-900"
    >
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#F7F6F2]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#0033CC]" />
            <span className="text-sm font-semibold tracking-tight text-slate-900">Pilli</span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-[#0033CC] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0029A3] transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#0033CC 1px, transparent 1px), linear-gradient(90deg, #0033CC 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Accent blob */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#E6ECFF] opacity-60" />

        <div className="relative mx-auto max-w-6xl">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#0033CC]/20 bg-[#E6ECFF] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
              Clinical Prescription Platform
            </span>
          </div>

          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            {/* Left: Copy */}
            <div className="space-y-7">
              <h1
                style={{ fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1.1 }}
                className="text-5xl font-normal text-slate-900 md:text-6xl"
              >
                Clinical precision
                <br />
                <em className="text-[#0033CC] not-italic">for every</em>
                <br />
                digital script
              </h1>
              <p className="max-w-md text-base leading-relaxed text-slate-500">
                Secure prescription workflows for prescribers and med staff—structured Signa, PDF
                output, and audit trails aligned to your compliance posture.
              </p>

              {/* Stats row */}
              <div className="flex gap-8 border-y border-slate-200 py-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-semibold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF8A00] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 hover:bg-[#D97400] transition-colors"
                >
                  Get started free
                  <span className="text-white/70">→</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 transition-colors"
                >
                  View demo
                </Link>
              </div>
            </div>

            {/* Right: Prescription preview card */}
            <div className="relative">
              {/* Shadow card behind */}
              <div className="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border border-slate-200 bg-white opacity-40" />

              <div className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60">
                {/* Card header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#0033CC]" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      New Prescription
                    </span>
                  </div>
                  <span className="rounded-full bg-[#E6ECFF] px-3 py-1 text-xs font-semibold text-[#0033CC]">
                    Draft
                  </span>
                </div>

                {/* Patient row */}
                <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium text-slate-400 mb-1">Patient</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                      JD
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Juan Dela Cruz</p>
                      <p className="text-xs text-slate-400">DOB: 14 Mar 1978 · #PT-00412</p>
                    </div>
                  </div>
                </div>

                {/* Drug rows */}
                {[
                  { drug: "Amoxicillin 500 mg", sig: "1 cap TID × 7 days", qty: "21" },
                  { drug: "Ibuprofen 400 mg", sig: "1 tab PRN pain q8h", qty: "15" },
                ].map((rx, i) => (
                  <div
                    key={i}
                    className="mb-3 rounded-xl border border-slate-100 px-4 py-3 last:mb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{rx.drug}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{rx.sig}</p>
                      </div>
                      <span className="text-xs text-slate-400">Qty {rx.qty}</span>
                    </div>
                  </div>
                ))}

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Dr. Maria Santos, MD</p>
                    <p className="text-xs text-slate-400">PRC Lic. 0012345 · Issued 8 May 2026</p>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-lg bg-[#FF8A00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#D97400] transition-colors">
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
                Platform
              </p>
              <h2
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                className="text-3xl font-normal text-slate-900 md:text-4xl"
              >
                Built for the clinic,
                <br />
                not the spreadsheet
              </h2>
            </div>
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#0033CC] underline underline-offset-4 md:block hover:text-[#0029A3]"
            >
              See all features →
            </Link>
          </div>

          <div className="grid gap-px bg-slate-100 md:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden">
            {features.map((item, i) => (
              <div
                key={item.title}
                className="group bg-white p-7 hover:bg-[#F7F6F2] transition-colors"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-[#0033CC] group-hover:border-[#0033CC]/30 group-hover:bg-[#E6ECFF] transition-all">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust band ── */}
      <section id="security" className="border-y border-slate-200 bg-[#F7F6F2] px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Compliance &amp; Security
          </p>
          <div className="grid gap-6 text-center md:grid-cols-3">
            {[
              {
                title: "End-to-end encrypted",
                body: "Patient data encrypted in transit and at rest with AES-256.",
              },
              {
                title: "Full audit trail",
                body: "Every action timestamped, attributed, and exportable for regulatory review.",
              },
              {
                title: "Role-based access",
                body: "Physicians, nurses, and admins get exactly the access their role requires.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-7 text-left">
                <div className="mb-1 h-1 w-8 rounded-full bg-[#0033CC]" />
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Get started today
          </p>
          <h2
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            className="mb-6 text-4xl font-normal text-white md:text-5xl"
          >
            Ready to modernize
            <br />
            <em className="text-[#FF8A00] not-italic">your clinic?</em>
          </h2>
          <p className="mb-10 text-base text-slate-400">
            Start with secure login and prescription drafting. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-[#FF8A00] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/30 hover:bg-[#D97400] transition-colors"
            >
              Create free account →
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-700 px-7 py-3.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            >
              Schedule a demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 bg-slate-900 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-slate-600 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
            <span className="font-semibold text-slate-400">Pilli</span>
          </div>
          <p>© 2026 Pilli. Clinical-grade prescription management.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </main>
  );
}