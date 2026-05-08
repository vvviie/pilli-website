import { prescriptionFieldMap } from "@/lib/airtable-field-map";
import { readWithRetry } from "@/lib/read-with-retry";

const readAirtableConfig = () => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const tableName = process.env.AIRTABLE_PRESCRIPTIONS_TABLE?.trim() ?? "Prescriptions";

  return { apiKey, baseId, tableName };
};

const readAirtableDateValue = (isoDateString) => {
  if (!isoDateString) {
    return new Date().toISOString().slice(0, 10);
  }

  const parsedDate = new Date(isoDateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return parsedDate.toISOString().slice(0, 10);
};

const readRecordFields = (payload) => ({
  [prescriptionFieldMap.transactionId]: payload.transactionId,
  [prescriptionFieldMap.createdAt]: readAirtableDateValue(payload.createdAtIso),
  [prescriptionFieldMap.createdBy]: payload.createdByEmail,
  [prescriptionFieldMap.physicianEmail]: payload.physicianEmail,
  [prescriptionFieldMap.patientName]: payload.patientName,
  [prescriptionFieldMap.patientAge]: String(payload.patientAge ?? ""),
  [prescriptionFieldMap.patientSex]: payload.patientSex,
  [prescriptionFieldMap.drugName]: payload.drugName,
  [prescriptionFieldMap.drugDosage]: payload.drugDosage,
  [prescriptionFieldMap.dosePerIntake]: payload.dosePerIntake,
  [prescriptionFieldMap.frequency]: payload.frequency,
  [prescriptionFieldMap.route]: payload.route,
  [prescriptionFieldMap.duration]: payload.duration,
  [prescriptionFieldMap.quantity]: payload.quantity,
  [prescriptionFieldMap.signa]: payload.signa,
  [prescriptionFieldMap.clinicalNotes]: payload.clinicalNotes,
  [prescriptionFieldMap.firestoreDocumentId]: payload.firestoreDocumentId,
  [prescriptionFieldMap.syncStatus]: payload.syncStatus,
});

const uploadPdfAttachmentToAirtable = async ({
  apiKey,
  baseId,
  recordId,
  attachmentFieldId,
  pdfBase64,
  pdfFileName,
}) => {
  const uploadResponse = await readWithRetry({
    label: "airtable_pdf_attachment_upload",
    performFetch: () =>
      fetch(`https://content.airtable.com/v0/${baseId}/${recordId}/${attachmentFieldId}/uploadAttachment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentType: "application/pdf",
          file: pdfBase64,
          filename: pdfFileName || "prescription.pdf",
        }),
      }),
  });

  if (!uploadResponse.ok) {
    const uploadError = await uploadResponse.text();
    throw new Error(uploadError || `Attachment upload failed with status ${uploadResponse.status}`);
  }

  return uploadResponse.json();
};

const readExistingRecordId = async ({ apiKey, baseId, tableName, transactionId }) => {
  const filterFormula = `{${prescriptionFieldMap.transactionId}} = '${transactionId.replace(/'/g, "\\'")}'`;
  const queryUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
  queryUrl.searchParams.set("maxRecords", "1");
  queryUrl.searchParams.set("filterByFormula", filterFormula);

  const response = await readWithRetry({
    label: "airtable_prescriptions_lookup",
    performFetch: () =>
      fetch(queryUrl.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      }),
  });

  if (!response.ok) {
    return null;
  }

  const responseJson = await response.json();
  return responseJson.records?.[0]?.id ?? null;
};

export async function POST(request) {
  const { apiKey, baseId, tableName } = readAirtableConfig();
  if (!apiKey || !baseId) {
    return Response.json(
      { message: "Airtable is not configured. Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID." },
      { status: 500 },
    );
  }

  const requestBody = await request.json();
  const payload = requestBody?.payload;
  const pdfBase64 = requestBody?.pdfBase64 ?? "";
  const pdfFileName = requestBody?.pdfFileName ?? "";
  const airtablePdfFieldId = "fldkWmN0PPq0HULlk";
  if (!payload?.transactionId) {
    return Response.json({ message: "Missing transactionId in payload." }, { status: 400 });
  }

  const existingRecordId = await readExistingRecordId({
    apiKey,
    baseId,
    tableName,
    transactionId: payload.transactionId,
  });
  const fields = readRecordFields(payload);

  const endpointUrl = existingRecordId
    ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${existingRecordId}`
    : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const method = existingRecordId ? "PATCH" : "POST";
  const body = existingRecordId ? { fields } : { records: [{ fields }] };

  const writeResponse = await readWithRetry({
    label: "airtable_prescriptions_write",
    performFetch: () =>
      fetch(endpointUrl, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
  });

  if (!writeResponse.ok) {
    const errorBody = await writeResponse.text();
    return Response.json(
      {
        message: "Failed to save prescription in Airtable.",
        detail: errorBody || `status ${writeResponse.status}`,
      },
      { status: writeResponse.status },
    );
  }

  const responseJson = await writeResponse.json();
  const recordId = existingRecordId ? responseJson.id : responseJson.records?.[0]?.id;

  let uploadedPdfUrl = "";
  if (pdfBase64) {
    if (!airtablePdfFieldId) {
      return Response.json(
        {
          message: "Airtable PDF field is not configured.",
          detail: "Set AIRTABLE_PDF_FIELD_ID to your attachment field ID (for PDF column).",
        },
        { status: 500 },
      );
    }

    try {
      const uploadResult = await uploadPdfAttachmentToAirtable({
        apiKey,
        baseId,
        recordId,
        attachmentFieldId: airtablePdfFieldId,
        pdfBase64,
        pdfFileName,
      });
      uploadedPdfUrl = uploadResult?.attachment?.url ?? "";
    } catch (uploadError) {
      return Response.json(
        {
          message: "Prescription record saved, but PDF attachment upload failed.",
          detail: uploadError instanceof Error ? uploadError.message : "Unknown attachment upload error",
        },
        { status: 500 },
      );
    }
  }

  return Response.json({
    message: "Prescription synced to Airtable.",
    airtableRecordId: recordId ?? null,
    uploadedPdfUrl,
  });
}
