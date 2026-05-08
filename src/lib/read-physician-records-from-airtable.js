import { physicianFieldMap } from "@/lib/airtable-field-map";
import { readWithRetry } from "@/lib/read-with-retry";

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

  return "";
};

export default async function readPhysicianRecordsFromAirtable() {
  const { apiKey, baseId, table } = readAirtableEnv();
  if (!apiKey || !baseId) {
    return [];
  }

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("sort[0][field]", physicianFieldMap.email);
  url.searchParams.set("sort[0][direction]", "asc");

  const response = await readWithRetry({
    label: "airtable_physicians_list",
    performFetch: () =>
      fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      }),
  });

  if (!response.ok) {
    return [];
  }

  const responseJson = await response.json();
  return (responseJson.records ?? [])
    .map((record) => {
      const fields = record.fields ?? {};
      const email = String(fields[physicianFieldMap.email] ?? "").trim();
      return {
        recordId: record.id,
        email,
        fullName: String(fields[physicianFieldMap.fullName] ?? "").trim(),
        sex: String(fields[physicianFieldMap.sex] ?? "").trim(),
        licenseNumber: String(fields[physicianFieldMap.licenseNumber] ?? "").trim(),
        ptrNumber: String(fields[physicianFieldMap.ptrNumber] ?? "").trim(),
        signatureUrl: readSignatureUrlValue(fields[physicianFieldMap.signatureUrl]),
      };
    })
    .filter((record) => Boolean(record.email));
}
