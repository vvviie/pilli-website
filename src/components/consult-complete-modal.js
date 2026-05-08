"use client";

import { useRouter } from "next/navigation";

export default function ConsultCompleteModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const onGoToDashboard = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8">

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
        </div>

        {/* Copy */}
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-600">
          Consult completed
        </p>
        <h2
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          className="mt-2 text-center text-2xl font-normal text-slate-900"
        >
          Prescription finalized
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
          The prescription has been saved and synced to Airtable.
          You can return to the dashboard or issue another script.
        </p>

        {/* Actions */}
        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex-1 rounded-xl bg-[#FF8A00] py-3 text-sm font-semibold text-white hover:bg-[#D97400] transition-colors"
          >
            Go to dashboard →
          </button>
        </div>

      </div>
    </div>
  );
}