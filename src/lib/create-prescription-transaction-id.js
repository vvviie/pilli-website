export default function createPrescriptionTransactionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `rx-${Date.now()}`;
}
