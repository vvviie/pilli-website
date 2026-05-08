import { physicianFieldMap } from "@/lib/airtable-field-map";
import { logPrescriptionEvent } from "@/lib/log-prescription-event";
import { readWithRetry } from "@/lib/read-with-retry";

const readStubProfile = (email, sourceReason = "unknown") => ({
  email,
  fullName: "",
  sex: "",
  licenseNumber: "DEMO-LIC-0001",
  ptrNumber: "DEMO-PTR-0001",
  signatureUrl: null,
  source: "stub",
  sourceReason,
});

const readAirtableEnv = () => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const table = process.env.AIRTABLE_PHYSICIANS_TABLE?.trim() ?? "Physicians";
  return { apiKey, baseId, table };
};

const readSignatureUrlValue = (signatureUrlRaw) => {
  if (typeof signatureUrlRaw === "string" && signatureUrlRaw.length > 0) {
    return signatureUrlRaw;
  }

  if (Array.isArray(signatureUrlRaw) && signatureUrlRaw.length > 0) {
    const firstAttachment = signatureUrlRaw[0];
    if (typeof firstAttachment?.url === "string" && firstAttachment.url.length > 0) {
      return firstAttachment.url;
    }
  }

  return null;
};

export const readPhysicianProfileFromAirtable = async (email) => {
  const { apiKey, baseId, table } = readAirtableEnv();
  const normalizedEmail = email.trim().toLowerCase();

  if (!apiKey || !baseId) {
    logPrescriptionEvent({
      event: "physician_profile_stub",
      level: "info",
      detail: { reason: "missing_airtable_env" },
    });
    return readStubProfile(email, "missing_airtable_env");
  }

  const escapedEmail = normalizedEmail.replace(/'/g, "\\'");
  const filterFormula = `LOWER({${physicianFieldMap.email}}) = '${escapedEmail}'`;
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
  url.searchParams.set("filterByFormula", filterFormula);
  url.searchParams.set("maxRecords", "1");

  try {
    const response = await readWithRetry({
      label: "airtable_physician_profile",
      performFetch: () =>
        fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store",
        }),
    });

    if (!response.ok) {
      logPrescriptionEvent({
        event: "physician_profile_airtable_error",
        level: "warn",
        detail: { status: String(response.status) },
      });
      return readStubProfile(email, "airtable_response_not_ok");
    }

    const json = await response.json();
    const fields = json.records?.[0]?.fields;
    if (!fields) {
      logPrescriptionEvent({
        event: "physician_profile_not_found",
        level: "warn",
        detail: { normalizedEmail },
      });
      return readStubProfile(email, "no_matching_physician_record");
    }

    const fullName = String(fields[physicianFieldMap.fullName] ?? "");
    const sex = String(fields[physicianFieldMap.sex] ?? "");
    const licenseNumber = String(fields[physicianFieldMap.licenseNumber] ?? "");
    const ptrNumber = String(fields[physicianFieldMap.ptrNumber] ?? "");
    const signatureUrlRaw = fields[physicianFieldMap.signatureUrl];
    const signatureUrl = readSignatureUrlValue(signatureUrlRaw);

    return {
      email,
      fullName,
      sex,
      licenseNumber: licenseNumber || "N/A",
      ptrNumber: ptrNumber || "N/A",
      signatureUrl,
      source: "airtable",
      sourceReason: "ok",
    };
  } catch (error) {
    logPrescriptionEvent({
      event: "physician_profile_exception",
      level: "error",
      detail: { message: error instanceof Error ? error.message : "unknown" },
    });
    return readStubProfile(email, "exception");
  }
};
