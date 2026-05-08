const adminEmailList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((emailAddress) => emailAddress.trim().toLowerCase())
  .filter(Boolean);

export default function readUserRoleFromEmail(emailAddress) {
  const normalizedEmailAddress = emailAddress?.trim().toLowerCase();
  if (!normalizedEmailAddress) {
    return "MedStaff";
  }

  if (adminEmailList.includes(normalizedEmailAddress)) {
    return "Admin";
  }

  if (normalizedEmailAddress.includes("doctor")) {
    return "Physician";
  }

  return "MedStaff";
}
