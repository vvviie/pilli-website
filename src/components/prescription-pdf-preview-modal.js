"use client";

export default function PrescriptionPdfPreviewModal({
  isOpen,
  onClose,
  pdfBlobUrl,
  pdfFileName,
  isGenerating,
  isCompletingConsult,
  onCompleteConsult,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#0033CC]" />
            <h2
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              className="text-lg font-normal text-slate-900"
            >
              Prescription PDF preview
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>

        {/* PDF viewport */}
        <div className="flex-1 bg-[#F7F6F2] p-4">
          {isGenerating || !pdfBlobUrl ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0033CC]" />
              <p className="text-sm text-slate-400">Generating PDF…</p>
            </div>
          ) : (
            <iframe
              title="Prescription PDF Preview"
              src={pdfBlobUrl}
              className="h-full w-full rounded-2xl border border-slate-200 bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCompleteConsult}
            disabled={isGenerating || isCompletingConsult}
            className="rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {isCompletingConsult ? "Completing…" : "Complete consult"}
          </button>
          <a
            href={pdfBlobUrl}
            download={pdfFileName}
            className="rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D97400] transition-colors"
          >
            Download PDF
          </a>
        </div>

      </div>
    </div>
  );
}