export default function readPrescriptionPreview(prescriptionValues) {
  const {
    drugName,
    drugDosage,
    dosage,
    frequency,
    route,
    durationValue,
    durationUnit,
    instructions,
    quantity,
  } = prescriptionValues;

  const medicationDisplayName = drugName || "Drug name";
  const strengthValue = drugDosage || "N/A";
  const dosageValue = dosage || "N/A";
  const frequencyValue = frequency || "N/A";
  const routeValue = route || "N/A";
  const durationDisplayValue = durationValue ? `${durationValue} ${durationUnit}` : "N/A";
  const instructionValue = instructions || "No special instructions.";
  const quantityValue = quantity || "N/A";

  return {
    medicationDisplayName,
    strengthValue,
    dosageValue,
    frequencyValue,
    routeValue,
    durationDisplayValue,
    instructionValue,
    quantityValue,
  };
}
