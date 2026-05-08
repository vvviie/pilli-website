import { durationUnitOptions, frequencyOptions, routeOptions } from "@/lib/prescription-form-options";

const readDurationValues = (draftRecord) => {
  const durationValueFromRecord = String(draftRecord?.durationValue ?? "").trim();
  const durationUnitFromRecord = String(draftRecord?.durationUnit ?? "").trim();
  if (durationValueFromRecord && durationUnitFromRecord) {
    return {
      durationValue: durationValueFromRecord,
      durationUnit: durationUnitFromRecord,
    };
  }

  const durationText = String(draftRecord?.duration ?? "").trim();
  const matchedDurationParts = durationText.match(/^(\d+)\s+([A-Za-z]+)$/);
  if (!matchedDurationParts) {
    return { durationValue: "", durationUnit: durationUnitOptions[0] };
  }

  const normalizedDurationUnit = matchedDurationParts[2].toLowerCase();
  const hasMatchingDurationUnit = durationUnitOptions.includes(normalizedDurationUnit);
  return {
    durationValue: matchedDurationParts[1],
    durationUnit: hasMatchingDurationUnit ? normalizedDurationUnit : durationUnitOptions[0],
  };
};

const readNormalizedPatientSex = (patientSexRawValue) => {
  const normalizedValue = String(patientSexRawValue ?? "").trim().toLowerCase();
  if (normalizedValue === "male") {
    return "Male";
  }

  if (normalizedValue === "prefer not to say" || normalizedValue === "prefer_not_to_say") {
    return "Prefer not to say";
  }

  if (normalizedValue === "female") {
    return "Female";
  }

  return "Female";
};

export default function readPrescriptionFormValuesFromDraft(draftRecord) {
  const { durationValue, durationUnit } = readDurationValues(draftRecord);
  const frequencyValue = String(draftRecord?.frequency ?? "").trim();
  const routeValue = String(draftRecord?.route ?? "").trim();
  const patientSexValue = readNormalizedPatientSex(draftRecord?.patientSex);

  return {
    transactionId: String(draftRecord?.transactionId ?? "").trim(),
    physicianEmail: String(draftRecord?.physicianEmail ?? "").trim(),
    formValues: {
      patientName: String(draftRecord?.patientName ?? "").trim(),
      patientAge: String(draftRecord?.patientAge ?? "").trim(),
      patientSex: patientSexValue,
      drugName: String(draftRecord?.drugName ?? "").trim(),
      drugDosage: String(draftRecord?.drugDosage ?? "").trim(),
      dosage: String(draftRecord?.dosePerIntake ?? "").trim(),
      frequency: frequencyValue || frequencyOptions[0],
      route: routeValue || routeOptions[0],
      durationValue,
      durationUnit,
      quantity: String(draftRecord?.quantity ?? "").trim(),
      instructions: String(draftRecord?.signa ?? "").trim(),
      notes: String(draftRecord?.clinicalNotes ?? "").trim(),
    },
  };
}
