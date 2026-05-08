import { prescriptionFieldMap } from "@/lib/airtable-field-map";
import { readWithRetry } from "@/lib/read-with-retry";

const readAirtableConfig = () => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const tableName = process.env.AIRTABLE_PRESCRIPTIONS_TABLE?.trim() ?? "Prescriptions";
  return { apiKey, baseId, tableName };
};

const readPdfUrl = (pdfValue) => {
  if (typeof pdfValue === "string") {
    return pdfValue;
  }

  if (Array.isArray(pdfValue) && pdfValue.length > 0) {
    const firstAttachment = pdfValue[0];
    if (typeof firstAttachment?.url === "string") {
      return firstAttachment.url;
    }
  }

  return "";
};

export async function GET(request) {
  const { apiKey, baseId, tableName } = readAirtableConfig();
  if (!apiKey || !baseId) {
    return Response.json(
      { message: "Airtable is not configured. Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID." },
      { status: 500 },
    );
  }

  const queryUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
  queryUrl.searchParams.set("pageSize", "100");
  queryUrl.searchParams.set("sort[0][field]", prescriptionFieldMap.createdAt);
  queryUrl.searchParams.set("sort[0][direction]", "desc");

  const response = await readWithRetry({
    label: "airtable_prescriptions_list",
    performFetch: () =>
      fetch(queryUrl.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return Response.json(
      {
        message: "Failed to load prescription logs from Airtable.",
        detail: errorBody || `status ${response.status}`,
      },
      { status: response.status },
    );
  }

  const responseJson = await response.json();
  const logs = (responseJson.records ?? []).map((record) => {
    const fields = record.fields ?? {};
    return {
      recordId: record.id,
      transactionId: fields[prescriptionFieldMap.transactionId] ?? "",
      createdAt: fields[prescriptionFieldMap.createdAt] ?? "",
      createdBy: fields[prescriptionFieldMap.createdBy] ?? "",
      physicianEmail: fields[prescriptionFieldMap.physicianEmail] ?? "",
      patientName: fields[prescriptionFieldMap.patientName] ?? "",
      patientAge: fields[prescriptionFieldMap.patientAge] ?? "",
      patientSex: fields[prescriptionFieldMap.patientSex] ?? "",
      drugName: fields[prescriptionFieldMap.drugName] ?? "",
      drugDosage: fields[prescriptionFieldMap.drugDosage] ?? "",
      dosePerIntake: fields[prescriptionFieldMap.dosePerIntake] ?? "",
      frequency: fields[prescriptionFieldMap.frequency] ?? "",
      route: fields[prescriptionFieldMap.route] ?? "",
      duration: fields[prescriptionFieldMap.duration] ?? "",
      quantity: fields[prescriptionFieldMap.quantity] ?? "",
      signa: fields[prescriptionFieldMap.signa] ?? "",
      clinicalNotes: fields[prescriptionFieldMap.clinicalNotes] ?? "",
      pdfUrl: readPdfUrl(fields[prescriptionFieldMap.pdf]),
      syncStatus: fields[prescriptionFieldMap.syncStatus] ?? "",
      firestoreDocumentId: fields[prescriptionFieldMap.firestoreDocumentId] ?? "",
    };
  });

  const requestUrl = new URL(request.url);
  const roleFilter = requestUrl.searchParams.get("role")?.trim() ?? "";
  const emailFilter = requestUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";

  const filteredLogs =
    roleFilter === "Physician" && emailFilter
      ? logs.filter((log) => {
          const createdBy = String(log.createdBy ?? "").trim().toLowerCase();
          const physicianEmail = String(log.physicianEmail ?? "").trim().toLowerCase();
          return createdBy === emailFilter || physicianEmail === emailFilter;
        })
      : logs;

  return Response.json({ logs: filteredLogs });
}
