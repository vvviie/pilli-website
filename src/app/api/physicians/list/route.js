import readPhysicianRecordsFromAirtable from "@/lib/read-physician-records-from-airtable";

export async function GET() {
  const physicians = await readPhysicianRecordsFromAirtable();
  return Response.json({ physicians });
}
