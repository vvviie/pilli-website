import { readPhysicianProfileFromAirtable } from "@/lib/read-physician-profile-from-airtable";

export async function GET(request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.trim() ?? "";

  if (!email) {
    return Response.json({ message: "Missing physician email query parameter." }, { status: 400 });
  }

  const physicianProfile = await readPhysicianProfileFromAirtable(email);
  return Response.json({
    email: physicianProfile.email,
    fullName: physicianProfile.fullName ?? "",
    signatureUrl: physicianProfile.signatureUrl ?? "",
    source: physicianProfile.source,
    sourceReason: physicianProfile.sourceReason ?? "unknown",
  });
}
