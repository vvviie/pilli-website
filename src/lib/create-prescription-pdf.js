import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSafePdfName(patientName) {
  const normalizedName = (patientName || "patient")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalizedName || "patient";
}

/** Draw a filled rounded-rectangle. jsPDF's built-in roundedRect only strokes. */
function filledRoundedRect(doc, x, y, w, h, r, fillColor) {
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

/** Draw a labelled key–value row and return the new Y position. */
function labeledRow(doc, label, value, x, y, pageWidth, labelColor, valueColor) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...labelColor);
  doc.text(label.toUpperCase(), x, y);

  const labelWidth = doc.getTextWidth(label.toUpperCase()) + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...valueColor);
  doc.text(String(value ?? "—"), x + labelWidth, y);
  return y + 15;
}

/** Thin horizontal rule */
function rule(doc, x1, x2, y, color = [220, 228, 240]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.line(x1, y, x2, y);
}

/** Section header with a coloured left accent bar */
function sectionHeader(doc, title, x, y, accentColor = [14, 116, 144]) {
  doc.setFillColor(...accentColor);
  doc.rect(x, y - 9, 3, 13, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...accentColor);
  doc.text(title, x + 8, y);
  return y + 6;
}

function readImageDataUrlFromBlob(imageBlob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const resultValue = typeof fileReader.result === "string" ? fileReader.result : "";
      if (!resultValue) {
        reject(new Error("Unable to convert image blob to data URL."));
        return;
      }
      resolve(resultValue);
    };
    fileReader.onerror = () => reject(new Error("FileReader failed while reading signature image."));
    fileReader.readAsDataURL(imageBlob);
  });
}

async function readSignatureDataUrl(signatureUrl) {
  if (!signatureUrl) {
    return "";
  }

  const response = await fetch(signatureUrl);
  if (!response.ok) {
    throw new Error(`Signature fetch failed with status ${response.status}.`);
  }

  const signatureBlob = await response.blob();
  return readImageDataUrlFromBlob(signatureBlob);
}

// ---------------------------------------------------------------------------
// Palette & constants
// ---------------------------------------------------------------------------
const NAVY       = [15,  23,  42];
const TEAL       = [14, 116, 144];
const TEAL_LIGHT = [207, 240, 247];
const SLATE      = [71,  85, 105];
const LIGHT_GREY = [241, 245, 249];
const WHITE      = [255, 255, 255];
const BORDER     = [203, 213, 225];

const PAGE_W   = 595;   // A4 pt width
const PAGE_H   = 842;   // A4 pt height
const MARGIN_L = 44;
const MARGIN_R = 551;
const CONTENT_W = MARGIN_R - MARGIN_L;

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default async function createPrescriptionPdf({
  prescriptionValues,
  prescriptionPreview,
  prescriberFullName,
  prescriberEmail,
  prescriberSignatureUrl,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const issuedByDisplayName = prescriberFullName || prescriberEmail || "—";

  // ── HEADER BAND ──────────────────────────────────────────────────────────
  // Dark background
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 70, "F");

  // Teal accent strip
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, 5, 70, "F");

  // Clinic / brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...WHITE);
  doc.text("CLINICAL PRESCRIPTION", MARGIN_L + 10, 30);

  // Issuer pill
  doc.setFillColor(...TEAL);
  doc.roundedRect(MARGIN_L + 9, 38, 300, 16, 4, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...WHITE);
  doc.text(`Issued by: ${issuedByDisplayName}`, MARGIN_L + 14, 49);

  // Date badge (top-right)
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 210, 230);
  doc.text(dateStr, MARGIN_R - doc.getTextWidth(dateStr), 49);

  let y = 96;

  // ── META ROW ─────────────────────────────────────────────────────────────
  // Light pill row for prescription type
  filledRoundedRect(doc, MARGIN_L, y - 12, CONTENT_W, 20, 5, LIGHT_GREY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text("RX TYPE", MARGIN_L + 8, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NAVY);
  doc.text("Outpatient Consultation", MARGIN_L + 52, y);
  y += 20;

  // ── PATIENT INFORMATION ──────────────────────────────────────────────────
  y = sectionHeader(doc, "Patient Information", MARGIN_L, y + 14, TEAL);
  rule(doc, MARGIN_L, MARGIN_R, y + 2);
  y += 14;

  // Two-column layout for patient info
  const col2X = MARGIN_L + CONTENT_W / 2;
  const rowH  = 15;

  const patientFields = [
    ["Name",   prescriptionValues.patientName,  MARGIN_L, y],
    ["Age",    prescriptionValues.patientAge,   col2X,    y],
  ];
  for (const [label, value, x] of patientFields) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(String(value ?? "—"), x, y + rowH - 2);
  }
  y += rowH + 10;

  const patientFields2 = [
    ["Sex / Gender", prescriptionValues.patientSex ?? "—", MARGIN_L, y],
  ];
  for (const [label, value, x] of patientFields2) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(String(value), x, y + rowH - 2);
  }
  y += rowH + 18;

  // ── MEDICATION ORDER ─────────────────────────────────────────────────────
  y = sectionHeader(doc, "Medication Order", MARGIN_L, y + 4, TEAL);
  rule(doc, MARGIN_L, MARGIN_R, y + 2);
  y += 14;

  // Drug name highlighted box
  filledRoundedRect(doc, MARGIN_L, y - 12, CONTENT_W, 24, 5, TEAL_LIGHT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...TEAL);
  doc.text(prescriptionPreview.medicationDisplayName ?? "—", MARGIN_L + 8, y + 3);
  y += 22;

  // Medication details in two-column grid
  const medDetails = [
    ["Dosage Strength", prescriptionPreview.strengthValue],
    ["Dose",            prescriptionPreview.dosageValue],
    ["Frequency",       prescriptionPreview.frequencyValue],
    ["Route",           prescriptionPreview.routeValue],
    ["Duration",        prescriptionPreview.durationDisplayValue],
    ["Quantity",        prescriptionPreview.quantityValue],
  ];

  for (let i = 0; i < medDetails.length; i += 2) {
    const [lLabel, lValue] = medDetails[i];
    const right = medDetails[i + 1];

    // Left cell
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(lLabel.toUpperCase(), MARGIN_L, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(String(lValue ?? "—"), MARGIN_L, y + rowH - 2);

    // Right cell (if exists)
    if (right) {
      const [rLabel, rValue] = right;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...SLATE);
      doc.text(rLabel.toUpperCase(), col2X, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...NAVY);
      doc.text(String(rValue ?? "—"), col2X, y + rowH - 2);
    }
    y += rowH + 10;
  }
  y += 8;

  // ── SIGNA / INSTRUCTIONS ─────────────────────────────────────────────────
  y = sectionHeader(doc, "Signa / Instructions", MARGIN_L, y + 4, TEAL);
  rule(doc, MARGIN_L, MARGIN_R, y + 2);
  y += 12;

  const instructionText = prescriptionPreview.instructionValue ?? "No instructions provided.";
  const instructionLines = doc.splitTextToSize(instructionText, CONTENT_W);

  const instrBoxH = instructionLines.length * 13 + 16;
  filledRoundedRect(doc, MARGIN_L, y - 4, CONTENT_W, instrBoxH, 5, LIGHT_GREY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(instructionLines, MARGIN_L + 8, y + 9);
  y += instrBoxH + 14;

  // ── CLINICAL NOTES ───────────────────────────────────────────────────────
  y = sectionHeader(doc, "Clinical Notes", MARGIN_L, y + 4, TEAL);
  rule(doc, MARGIN_L, MARGIN_R, y + 2);
  y += 12;

  const notesText  = prescriptionValues.notes || "No clinical notes provided.";
  const notesLines = doc.splitTextToSize(notesText, CONTENT_W);

  const notesBoxH = notesLines.length * 13 + 16;
  filledRoundedRect(doc, MARGIN_L, y - 4, CONTENT_W, notesBoxH, 5, LIGHT_GREY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(notesLines, MARGIN_L + 8, y + 9);
  y += notesBoxH + 14;

  // ── SIGNATURE BLOCK ──────────────────────────────────────────────────────
  const sigBoxY = Math.max(y + 20, PAGE_H - 160);

  rule(doc, MARGIN_L, MARGIN_R, sigBoxY);

  // Prescriber signature area
  const sigW = 160;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_L, sigBoxY + 50, MARGIN_L + sigW, sigBoxY + 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text("Prescriber Signature", MARGIN_L, sigBoxY + 60);
  doc.text(prescriberEmail ?? "", MARGIN_L, sigBoxY + 73);

  if (!prescriberSignatureUrl) {
    console.info("[pilli-prescription] pdf_signature_missing_url", {
      hasPrescriberEmail: Boolean(prescriberEmail),
    });
  } else {
    console.info("[pilli-prescription] pdf_signature_loading", { prescriberSignatureUrl });
    try {
      const signatureDataUrl = await readSignatureDataUrl(prescriberSignatureUrl);
      const signatureImageFormat = signatureDataUrl.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(signatureDataUrl, signatureImageFormat, MARGIN_L + 2, sigBoxY + 16, 120, 30);
      console.info("[pilli-prescription] pdf_signature_embedded", {
        signatureImageFormat,
        renderedWidth: 120,
        renderedHeight: 30,
      });
    } catch (signatureError) {
      console.error("[pilli-prescription] pdf_signature_embed_failed", signatureError);
    }
  }

  // Date signed
  const dateSigX = MARGIN_R - sigW;
  doc.line(dateSigX, sigBoxY + 50, MARGIN_R, sigBoxY + 50);
  doc.text("Date Signed", dateSigX, sigBoxY + 60);
  doc.text(new Date().toLocaleDateString(), dateSigX, sigBoxY + 73);

  // ── FOOTER BAND ──────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - 46, PAGE_W, 46, "F");

  doc.setFillColor(...TEAL);
  doc.rect(0, PAGE_H - 46, 5, 46, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(180, 210, 230);
  doc.text(
    "This prescription is electronically generated. For pharmacist verification, contact the issuing clinic.",
    MARGIN_L + 10,
    PAGE_H - 28,
  );
  doc.text("Confidential — For medical use only.", MARGIN_L + 10, PAGE_H - 16);

  // ── EXPORT ───────────────────────────────────────────────────────────────
  const pdfBlob    = doc.output("blob");
  const pdfBlobUrl = URL.createObjectURL(pdfBlob);
  const pdfFileName = `prescription-${readSafePdfName(prescriptionValues.patientName)}.pdf`;

  return { pdfBlob, pdfBlobUrl, pdfFileName };
}