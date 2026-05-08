import { physicianFieldMap } from "@/lib/airtable-field-map";
import { readWithRetry } from "@/lib/read-with-retry";

const readAirtableConfig = () => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  const baseId = process.env.AIRTABLE_BASE_ID?.trim();
  const tableName = process.env.AIRTABLE_PHYSICIANS_TABLE?.trim() ?? "Physicians";
  const signatureFieldId = "fldf1ojWIPF0VrRYh";
  return { apiKey, baseId, tableName, signatureFieldId };
};

const readExistingRecordId = async ({ apiKey, baseId, tableName, email }) => {
  const normalizedEmail = email.trim().toLowerCase().replace(/'/g, "\\'");
  const queryUrl = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`);
  queryUrl.searchParams.set("maxRecords", "1");
  queryUrl.searchParams.set("filterByFormula", `LOWER({${physicianFieldMap.email}}) = '${normalizedEmail}'`);

  const response = await readWithRetry({
    label: "airtable_physicians_lookup",
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
  const { apiKey, baseId, tableName, signatureFieldId } = readAirtableConfig();
  if (!apiKey || !baseId) {
    return Response.json(
      { message: "Airtable is not configured. Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID." },
      { status: 500 },
    );
  }

  const requestBody = await request.json();
  const payload = requestBody?.payload ?? {};
  const email = String(payload.email ?? "").trim();
  const signatureBase64 = String(requestBody?.signatureBase64 ?? "").trim();
  const signatureFileName = String(requestBody?.signatureFileName ?? "").trim();
  const signatureContentType = String(requestBody?.signatureContentType ?? "").trim();
  if (!email) {
    return Response.json({ message: "Email is required." }, { status: 400 });
  }

  const fields = {
    [physicianFieldMap.email]: email,
    [physicianFieldMap.fullName]: String(payload.fullName ?? "").trim(),
    [physicianFieldMap.sex]: String(payload.sex ?? "").trim(),
    [physicianFieldMap.licenseNumber]: String(payload.licenseNumber ?? "").trim(),
    [physicianFieldMap.ptrNumber]: String(payload.ptrNumber ?? "").trim(),
  };

  const existingRecordId = await readExistingRecordId({
    apiKey,
    baseId,
    tableName,
    email,
  });

  const endpointUrl = existingRecordId
    ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${existingRecordId}`
    : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const method = existingRecordId ? "PATCH" : "POST";
  const body = existingRecordId ? { fields } : { records: [{ fields }] };

  const writeResponse = await readWithRetry({
    label: "airtable_physicians_write",
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
        message: "Failed to save physician in Airtable.",
        detail: errorBody || `status ${writeResponse.status}`,
      },
      { status: writeResponse.status },
    );
  }

  const responseJson = await writeResponse.json();
  const recordId = existingRecordId ? responseJson.id : responseJson.records?.[0]?.id;
  let uploadedSignatureUrl = "";

  if (signatureBase64) {
    if (!signatureFieldId) {
      return Response.json(
        {
          message: "Physician record saved, but signature upload skipped.",
          detail: "Set AIRTABLE_PHYSICIANS_SIGNATURE_FIELD_ID for attachment upload.",
        },
        { status: 500 },
      );
    }

    const uploadResponse = await readWithRetry({
      label: "airtable_physician_signature_upload",
      performFetch: () =>
        fetch(`https://content.airtable.com/v0/${baseId}/${recordId}/${signatureFieldId}/uploadAttachment`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentType: signatureContentType || "image/png",
            file: signatureBase64,
            filename: signatureFileName || "signature.png",
          }),
        }),
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.text();
      return Response.json(
        {
          message: "Physician saved, but signature attachment upload failed.",
          detail: uploadError || `status ${uploadResponse.status}`,
        },
        { status: uploadResponse.status },
      );
    }

    const uploadJson = await uploadResponse.json();
    uploadedSignatureUrl = uploadJson?.attachment?.url ?? "";
  }

  return Response.json({
    message: "Physician saved to Airtable.",
    physicianRecordId: recordId ?? null,
    uploadedSignatureUrl,
  });
}
