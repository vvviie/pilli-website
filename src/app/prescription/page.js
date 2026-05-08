"use client";

import AppShell from "@/components/app-shell";
import ConsultCompleteModal from "@/components/consult-complete-modal";
import FirebaseRouteGuard from "@/components/firebase-route-guard";
import PrescriptionPdfPreviewModal from "@/components/prescription-pdf-preview-modal";
import useFirebaseAuth from "@/hooks/use-firebase-auth";
import createPrescriptionTransactionId from "@/lib/create-prescription-transaction-id";
import createPrescriptionPdf from "@/lib/create-prescription-pdf";
import { durationUnitOptions, frequencyOptions, routeOptions } from "@/lib/prescription-form-options";
import prescriptionDrugCatalog from "@/lib/prescription-drug-catalog";
import readFirestoreWriteErrorMessage from "@/lib/read-firestore-write-error-message";
import readLatestPrescriptionDraftFromFirestore from "@/lib/read-latest-prescription-draft-from-firestore";
import readPrescriptionFormValuesFromCsv from "@/lib/read-prescription-form-values-from-csv";
import readPrescriptionFormValuesFromDraft from "@/lib/read-prescription-form-values-from-draft";
import readPrescriptionPersistencePayload from "@/lib/read-prescription-persistence-payload";
import readPrescriptionPreview from "@/lib/read-prescription-preview";
import upsertPrescriptionInFirestore from "@/lib/upsert-prescription-in-firestore";
import { Suspense, useEffect, useRef, useState } from "react";
import useUserRole from "@/hooks/use-user-role";
import { useRouter, useSearchParams } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function PrescriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser } = useFirebaseAuth();
  const userEmail = firebaseUser?.email ?? "Unknown user";
  const { role } = useUserRole();
  const prescriptionFormReference = useRef(null);
  const csvUploadInputReference = useRef(null);
  const [prescriptionValues, setPrescriptionValues] = useState({
    patientName: "",
    patientAge: "",
    patientSex: "Female",
    drugName: "",
    drugDosage: "",
    dosage: "",
    frequency: frequencyOptions[0],
    route: routeOptions[0],
    durationValue: "",
    durationUnit: durationUnitOptions[0],
    quantity: "",
    instructions: "",
    notes: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusMessageTone, setStatusMessageTone] = useState("success");
  const [prescriptionTransactionId, setPrescriptionTransactionId] = useState("");
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCompletingConsult, setIsCompletingConsult] = useState(false);
  const [isConsultCompleteModalOpen, setIsConsultCompleteModalOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [prescriberFullName, setPrescriberFullName] = useState("");
  const [prescriberSignatureUrl, setPrescriberSignatureUrl] = useState("");
  const [physicianOptions, setPhysicianOptions] = useState([]);
  const [selectedPhysicianEmail, setSelectedPhysicianEmail] = useState("");
  const [isPhysicianOptionsLoading, setIsPhysicianOptionsLoading] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const prescriptionPreview = readPrescriptionPreview(prescriptionValues);
  const dosageOptions = prescriptionDrugCatalog.readDosageOptionsFromDrugName(prescriptionValues.drugName);
  const prescriberEmail = role === "MedStaff" ? selectedPhysicianEmail : userEmail;

  const set = (key) => (e) =>
    setPrescriptionValues((prev) => ({ ...prev, [key]: e.target.value }));

  useEffect(() => {
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); };
  }, [pdfBlobUrl]);

  useEffect(() => {
    const loadPhysicianOptions = async () => {
      if (role !== "MedStaff") { setSelectedPhysicianEmail(userEmail); return; }
      setIsPhysicianOptionsLoading(true);
      try {
        const response = await fetch("/api/physicians/list", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load physicians from Airtable.");
        const responseJson = await response.json();
        const physicians = Array.isArray(responseJson?.physicians) ? responseJson.physicians : [];
        setPhysicianOptions(physicians);
        if (physicians.length > 0) {
          setSelectedPhysicianEmail(physicians[0].email);
          setPrescriberFullName(physicians[0].fullName || "");
        }
      } catch (err) {
        console.error("[pilli-prescription] physician_options_load_failed", err);
      } finally {
        setIsPhysicianOptionsLoading(false);
      }
    };
    loadPhysicianOptions();
  }, [role, userEmail]);

  useEffect(() => {
    const loadLatestDraft = async () => {
      if (!firebaseUser?.uid || hasLoadedDraft) {
        return;
      }

      try {
        const latestDraftRecord = await readLatestPrescriptionDraftFromFirestore({
          userId: firebaseUser.uid,
        });
        if (!latestDraftRecord) {
          setHasLoadedDraft(true);
          return;
        }

        const parsedDraftValues = readPrescriptionFormValuesFromDraft(latestDraftRecord);
        setPrescriptionValues(parsedDraftValues.formValues);
        setPrescriptionTransactionId(parsedDraftValues.transactionId);
        if (role === "MedStaff" && parsedDraftValues.physicianEmail) {
          setSelectedPhysicianEmail(parsedDraftValues.physicianEmail);
        }
        setStatusMessageTone("success");
        setStatusMessage("Draft loaded.");
      } catch (draftLoadError) {
        console.error("[pilli-prescription] draft_load_failed", draftLoadError);
      } finally {
        setHasLoadedDraft(true);
      }
    };

    loadLatestDraft();
  }, [firebaseUser?.uid, hasLoadedDraft, role]);

  useEffect(() => {
    const readPhysicianSignature = async () => {
      if (!prescriberEmail || prescriberEmail === "Unknown user") return;
      try {
        const response = await fetch(`/api/physicians/signature?email=${encodeURIComponent(prescriberEmail)}`);
        if (!response.ok) throw new Error(`Signature API failed with status ${response.status}`);
        const responseJson = await response.json();
        setPrescriberFullName(responseJson?.fullName ?? "");
        setPrescriberSignatureUrl(responseJson?.signatureUrl ?? "");
      } catch (err) {
        console.error("[pilli-prescription] physician_signature_read_failed", err);
      }
    };
    readPhysicianSignature();
  }, [prescriberEmail]);

  useEffect(() => {
    const csvMode = searchParams.get("csv");
    if (csvMode !== "1") {
      return;
    }

    setTimeout(() => {
      csvUploadInputReference.current?.click();
      router.replace("/prescription");
    }, 0);
  }, [router, searchParams]);

  const onGeneratePdf = async () => {
    if (!prescriberEmail) { setStatusMessageTone("error"); setStatusMessage("Select a prescribing physician first."); return; }
    if (!prescriptionFormReference.current?.reportValidity()) { setStatusMessageTone("error"); setStatusMessage("Complete required fields before generating the PDF."); return; }
    setIsGeneratingPdf(true);
    setIsPdfPreviewOpen(true);
    try {
      const pdfResult = await createPrescriptionPdf({ prescriptionValues, prescriptionPreview, prescriberFullName, prescriberEmail, prescriberSignatureUrl });
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlob(pdfResult.pdfBlob);
      setPdfBlobUrl(pdfResult.pdfBlobUrl);
      setPdfFileName(pdfResult.pdfFileName);
      setStatusMessageTone("success");
      setStatusMessage("PDF generated. Review the preview before downloading.");
    } catch (err) {
      console.error("[pilli-prescription] pdf_generation_failed", err);
      setStatusMessageTone("error");
      setStatusMessage("Unable to generate the PDF. Please try again.");
      setIsPdfPreviewOpen(false);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const readBlobAsBase64 = (blobValue) =>
    new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const resultValue = typeof fileReader.result === "string" ? fileReader.result : "";
        resolve(resultValue.includes(",") ? resultValue.split(",")[1] : resultValue);
      };
      fileReader.onerror = () => reject(new Error("Unable to convert PDF to base64."));
      fileReader.readAsDataURL(blobValue);
    });

  const onSaveDraft = async (event) => {
    event.preventDefault();
    if (!prescriberEmail) { setStatusMessageTone("error"); setStatusMessage("Select a prescribing physician first."); return; }
    const nextTransactionId = prescriptionTransactionId || createPrescriptionTransactionId();
    setPrescriptionTransactionId(nextTransactionId);
    const recordPayload = readPrescriptionPersistencePayload({ prescriptionValues, prescriptionPreview, createdByEmail: userEmail, createdByUid: firebaseUser?.uid ?? "", physicianEmail: prescriberEmail, status: "draft", transactionId: nextTransactionId, pdfUrl: "", pdfFileName });
    setIsSavingDraft(true);
    try {
      await upsertPrescriptionInFirestore({ userId: firebaseUser?.uid ?? "", transactionId: nextTransactionId, recordPayload });
      setStatusMessageTone("success");
      setStatusMessage("Draft saved.");
    } catch (err) {
      console.error("[pilli-prescription] save_draft_firestore_error", err);
      setStatusMessageTone("error");
      setStatusMessage(readFirestoreWriteErrorMessage(err, "Unable to save draft to Firestore."));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const onCsvUploadButtonClick = () => {
    csvUploadInputReference.current?.click();
  };

  const onCsvFileChange = async (event) => {
    const csvFile = event.target.files?.[0];
    if (!csvFile) {
      return;
    }

    try {
      const csvContent = await csvFile.text();
      const parsedCsv = readPrescriptionFormValuesFromCsv(csvContent);
      setPrescriptionValues((previousValues) => ({
        ...previousValues,
        ...parsedCsv.formValues,
      }));

      if (role === "MedStaff" && parsedCsv.physicianEmail) {
        setSelectedPhysicianEmail(parsedCsv.physicianEmail);
      }

      setStatusMessageTone("success");
      setStatusMessage("CSV loaded. Form fields were pre-filled from the first row.");
    } catch (csvError) {
      setStatusMessageTone("error");
      setStatusMessage(
        csvError instanceof Error ? csvError.message : "Unable to parse CSV. Please check file format.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const onCompleteConsult = async () => {
    if (!prescriberEmail) { setStatusMessageTone("error"); setStatusMessage("Select a prescribing physician first."); return; }
    if (!prescriptionFormReference.current?.reportValidity()) { setStatusMessageTone("error"); setStatusMessage("Complete required fields before completing consult."); return; }
    if (!pdfBlob) { setStatusMessageTone("error"); setStatusMessage("Generate the PDF first before completing consult."); return; }
    const nextTransactionId = prescriptionTransactionId || createPrescriptionTransactionId();
    setPrescriptionTransactionId(nextTransactionId);
    const recordPayload = readPrescriptionPersistencePayload({ prescriptionValues, prescriptionPreview, createdByEmail: userEmail, createdByUid: firebaseUser?.uid ?? "", physicianEmail: prescriberEmail, status: "completed", transactionId: nextTransactionId, pdfUrl: "", pdfFileName });
    setIsCompletingConsult(true);
    try {
      const pdfBase64 = await readBlobAsBase64(pdfBlob);
      await upsertPrescriptionInFirestore({ userId: firebaseUser?.uid ?? "", transactionId: nextTransactionId, recordPayload });
      const completeResponse = await fetch("/api/prescriptions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { ...recordPayload, syncStatus: "completed", firestoreDocumentId: nextTransactionId }, pdfBase64, pdfFileName }),
      });
      if (!completeResponse.ok) {
        let errorDetail = "Airtable sync failed.";
        try { const j = await completeResponse.json(); errorDetail = j?.detail || j?.message || errorDetail; } catch {}
        throw new Error(errorDetail);
      }
      const completeResponseJson = await completeResponse.json();
      await upsertPrescriptionInFirestore({ userId: firebaseUser?.uid ?? "", transactionId: nextTransactionId, recordPayload: { pdf: completeResponseJson?.uploadedPdfUrl ?? "", syncStatus: "synced" } });
      setIsPdfPreviewOpen(false);
      setIsConsultCompleteModalOpen(true);
      setStatusMessageTone("success");
      setStatusMessage("Consult completed. Record saved in Firestore and Airtable.");
    } catch (err) {
      console.error("[pilli-prescription] complete_consult_error", err);
      await upsertPrescriptionInFirestore({ userId: firebaseUser?.uid ?? "", transactionId: nextTransactionId, recordPayload: { syncStatus: "failed" } });
      setStatusMessageTone("error");
      setStatusMessage(err instanceof Error && err.message ? err.message : readFirestoreWriteErrorMessage(err, "Consult saved in Firestore, but Airtable sync failed."));
    } finally {
      setIsCompletingConsult(false);
    }
  };

  return (
    <FirebaseRouteGuard callbackPath="/prescription">
      <AppShell role={role} email={userEmail}>
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* Page header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
              Prescriptions
            </p>
            <h1
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              className="mt-1 text-3xl font-normal text-slate-900 md:text-4xl"
            >
              Create prescription
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete patient and medication details, then review the generated signa before finalizing.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

            {/* ── Form ── */}
            <form
              ref={prescriptionFormReference}
              className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60"
              onSubmit={onSaveDraft}
            >

              {/* Prescribing physician */}
              {role === "MedStaff" ? (
                <div>
                  <label className={labelClass}>Prescribing physician</label>
                  <select
                    value={selectedPhysicianEmail}
                    onChange={(e) => {
                      const nextEmail = e.target.value;
                      setSelectedPhysicianEmail(nextEmail);
                      const match = physicianOptions.find((p) => p.email === nextEmail);
                      setPrescriberFullName(match?.fullName || "");
                    }}
                    className={inputClass}
                    disabled={isPhysicianOptionsLoading}
                    required
                  >
                    {physicianOptions.length === 0 && (
                      <option value="">
                        {isPhysicianOptionsLoading ? "Loading physicians…" : "No physicians found"}
                      </option>
                    )}
                    {physicianOptions.map((p) => (
                      <option key={p.recordId} value={p.email}>
                        {p.fullName ? `${p.fullName} (${p.email})` : p.email}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Choose which physician this prescription is registered under.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Prescribing physician
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{prescriberEmail}</p>
                  </div>
                </div>
              )}

              {/* Patient information */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Patient information
                  </p>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Patient name</label>
                    <input
                      type="text"
                      value={prescriptionValues.patientName}
                      onChange={set("patientName")}
                      className={inputClass}
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="number"
                      min="0"
                      value={prescriptionValues.patientAge}
                      onChange={set("patientAge")}
                      className={inputClass}
                      placeholder="35"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Sex</label>
                    <select
                      value={prescriptionValues.patientSex}
                      onChange={set("patientSex")}
                      className={inputClass}
                    >
                      <option>Female</option>
                      <option>Male</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Medication order */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Medication order
                  </p>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Drug name</label>
                    <select
                      value={prescriptionValues.drugName}
                      onChange={(e) =>
                        setPrescriptionValues({
                          ...prescriptionValues,
                          drugName: e.target.value,
                          drugDosage: prescriptionDrugCatalog.readDefaultDosageFromDrugName(e.target.value),
                        })
                      }
                      className={inputClass}
                      required
                    >
                      <option value="" disabled>Select drug</option>
                      {prescriptionDrugCatalog.drugNameOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Dosage</label>
                    <select
                      value={prescriptionValues.drugDosage}
                      onChange={set("drugDosage")}
                      className={inputClass}
                      disabled={!prescriptionValues.drugName}
                      required
                    >
                      <option value="" disabled>Select dosage</option>
                      {dosageOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Dose</label>
                    <input
                      type="text"
                      value={prescriptionValues.dosage}
                      onChange={set("dosage")}
                      className={inputClass}
                      placeholder="1 capsule"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Frequency</label>
                    <select value={prescriptionValues.frequency} onChange={set("frequency")} className={inputClass}>
                      {frequencyOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Route</label>
                    <select value={prescriptionValues.route} onChange={set("route")} className={inputClass}>
                      {routeOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                  <label className={labelClass}>Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={prescriptionValues.durationValue}
                      onChange={set("durationValue")}
                      placeholder="7"
                      className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10"
                    />
                    <select
                      value={prescriptionValues.durationUnit}
                      onChange={set("durationUnit")}
                      className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-[#0033CC] focus:bg-white focus:ring-2 focus:ring-[#0033CC]/10"
                    >
                      {durationUnitOptions.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input
                      type="text"
                      value={prescriptionValues.quantity}
                      onChange={set("quantity")}
                      className={inputClass}
                      placeholder="14 capsules"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Signa</label>
                    <textarea
                      value={prescriptionValues.instructions}
                      onChange={set("instructions")}
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="Once a day after meals."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Clinical notes</label>
                    <textarea
                      value={prescriptionValues.notes}
                      onChange={set("notes")}
                      className={`${inputClass} min-h-20 resize-y`}
                      placeholder="Follow-up after 1 week for reassessment."
                    />
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-5">
                {statusMessage && (
                  <div
                    className={`mb-4 flex items-start gap-2 rounded-xl border px-4 py-3 ${
                      statusMessageTone === "error"
                        ? "border-red-100 bg-red-50"
                        : "border-emerald-100 bg-emerald-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        statusMessageTone === "error" ? "bg-red-500" : "bg-emerald-500"
                      }`}
                    />
                    <p
                      className={`text-xs ${
                        statusMessageTone === "error" ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {statusMessage}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <input
                    ref={csvUploadInputReference}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={onCsvFileChange}
                  />
                  <button
                    type="button"
                    onClick={onCsvUploadButtonClick}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Upload CSV
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingDraft}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingDraft ? "Saving…" : "Save draft"}
                  </button>
                  <button
                    type="button"
                    onClick={onGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="rounded-xl bg-[#FF8A00] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF8A00]/20 transition-colors hover:bg-[#D97400] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGeneratingPdf ? "Generating…" : "Process consult →"}
                  </button>
                </div>
              </div>
            </form>

            {/* ── Sidebar ── */}
            <aside className="space-y-4">

              {/* Preview card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Preview
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="mb-1 text-xs text-slate-400">Patient</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {prescriptionValues.patientName || "Patient name"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {prescriptionValues.patientAge || "Age"} · {prescriptionValues.patientSex}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 px-4 py-3">
                    <p className="mb-1 text-xs text-slate-400">Drug</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {prescriptionPreview.medicationDisplayName || "—"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">
                      {[
                        prescriptionPreview.strengthValue,
                        prescriptionPreview.dosageValue && `Dose: ${prescriptionPreview.dosageValue}`,
                        prescriptionPreview.frequencyValue,
                        prescriptionPreview.routeValue && `via ${prescriptionPreview.routeValue}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {prescriptionPreview.durationDisplayValue && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {prescriptionPreview.durationDisplayValue} · Qty {prescriptionPreview.quantityValue}
                      </p>
                    )}
                  </div>

                  {prescriptionPreview.instructionValue && (
                    <div className="rounded-xl border border-slate-100 px-4 py-3">
                      <p className="mb-1 text-xs text-slate-400">Signa</p>
                      <p className="text-sm text-slate-700">{prescriptionPreview.instructionValue}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety reminder */}
              <div className="rounded-2xl border border-[#0033CC]/15 bg-[#E6ECFF] px-5 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0033CC]" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#0033CC]">
                    Safety reminder
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-[#0029A3]">
                  Verify patient allergies and current medication list before finalizing each script.
                </p>
              </div>

            </aside>
          </div>
        </div>

        <PrescriptionPdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          pdfBlobUrl={pdfBlobUrl}
          pdfFileName={pdfFileName}
          isGenerating={isGeneratingPdf}
          isCompletingConsult={isCompletingConsult}
          onCompleteConsult={onCompleteConsult}
        />
        <ConsultCompleteModal
          isOpen={isConsultCompleteModalOpen}
          onClose={() => setIsConsultCompleteModalOpen(false)}
        />
      </AppShell>
    </FirebaseRouteGuard>
  );
}

export default function PrescriptionPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading prescription page...</div>}>
      <PrescriptionPageContent />
    </Suspense>
  );
}