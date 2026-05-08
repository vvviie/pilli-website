import { durationUnitOptions, frequencyOptions, routeOptions } from "@/lib/prescription-form-options";

const readNormalizedHeader = (headerValue) =>
  String(headerValue ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const headerFieldMap = {
  patientname: "patientName",
  patientage: "patientAge",
  patientsex: "patientSex",
  drugname: "drugName",
  drugdosage: "drugDosage",
  dose: "dosage",
  dosage: "dosage",
  doseperintake: "dosage",
  frequency: "frequency",
  route: "route",
  durationvalue: "durationValue",
  durationunit: "durationUnit",
  duration: "duration",
  quantity: "quantity",
  signa: "instructions",
  instructions: "instructions",
  clinicalnotes: "notes",
  notes: "notes",
  physicianemail: "physicianEmail",
};

const parseCsvRows = (csvContent) => {
  const rows = [];
  let currentCellValue = "";
  let currentRowValues = [];
  let isInsideQuotes = false;

  for (let index = 0; index < csvContent.length; index += 1) {
    const currentCharacter = csvContent[index];
    const nextCharacter = csvContent[index + 1];

    if (currentCharacter === '"' && isInsideQuotes && nextCharacter === '"') {
      currentCellValue += '"';
      index += 1;
      continue;
    }

    if (currentCharacter === '"') {
      isInsideQuotes = !isInsideQuotes;
      continue;
    }

    if (currentCharacter === "," && !isInsideQuotes) {
      currentRowValues.push(currentCellValue);
      currentCellValue = "";
      continue;
    }

    if ((currentCharacter === "\n" || currentCharacter === "\r") && !isInsideQuotes) {
      if (currentCharacter === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRowValues.push(currentCellValue);
      rows.push(currentRowValues);
      currentCellValue = "";
      currentRowValues = [];
      continue;
    }

    currentCellValue += currentCharacter;
  }

  if (currentCellValue.length > 0 || currentRowValues.length > 0) {
    currentRowValues.push(currentCellValue);
    rows.push(currentRowValues);
  }

  return rows.filter((rowValues) => rowValues.some((cellValue) => String(cellValue).trim().length > 0));
};

const readDurationValues = (csvMappedValues) => {
  const rawDurationValue = String(csvMappedValues.durationValue ?? "").trim();
  const rawDurationUnit = String(csvMappedValues.durationUnit ?? "").trim().toLowerCase();
  if (rawDurationValue && durationUnitOptions.includes(rawDurationUnit)) {
    return { durationValue: rawDurationValue, durationUnit: rawDurationUnit };
  }

  const durationText = String(csvMappedValues.duration ?? "").trim();
  const matchedDuration = durationText.match(/^(\d+)\s+([A-Za-z]+)$/);
  if (!matchedDuration) {
    return { durationValue: "", durationUnit: durationUnitOptions[0] };
  }

  const normalizedUnit = matchedDuration[2].toLowerCase();
  return {
    durationValue: matchedDuration[1],
    durationUnit: durationUnitOptions.includes(normalizedUnit) ? normalizedUnit : durationUnitOptions[0],
  };
};

const readNormalizedPatientSex = (patientSexValue) => {
  const normalizedValue = String(patientSexValue ?? "").trim().toLowerCase();
  if (normalizedValue === "male") {
    return "Male";
  }
  if (normalizedValue === "prefer not to say" || normalizedValue === "prefernottosay") {
    return "Prefer not to say";
  }
  return "Female";
};

export default function readPrescriptionFormValuesFromCsv(csvContent) {
  const rows = parseCsvRows(csvContent);
  if (rows.length < 2) {
    throw new Error("CSV must include headers and at least one data row.");
  }

  const headerRow = rows[0];
  const firstDataRow = rows[1];
  const mappedValues = {};

  headerRow.forEach((headerValue, columnIndex) => {
    const normalizedHeader = readNormalizedHeader(headerValue);
    const mappedField = headerFieldMap[normalizedHeader];
    if (!mappedField) {
      return;
    }
    mappedValues[mappedField] = String(firstDataRow[columnIndex] ?? "").trim();
  });

  const { durationValue, durationUnit } = readDurationValues(mappedValues);

  return {
    physicianEmail: String(mappedValues.physicianEmail ?? "").trim(),
    formValues: {
      patientName: String(mappedValues.patientName ?? "").trim(),
      patientAge: String(mappedValues.patientAge ?? "").trim(),
      patientSex: readNormalizedPatientSex(mappedValues.patientSex),
      drugName: String(mappedValues.drugName ?? "").trim(),
      drugDosage: String(mappedValues.drugDosage ?? "").trim(),
      dosage: String(mappedValues.dosage ?? "").trim(),
      frequency: String(mappedValues.frequency ?? "").trim() || frequencyOptions[0],
      route: String(mappedValues.route ?? "").trim() || routeOptions[0],
      durationValue,
      durationUnit,
      quantity: String(mappedValues.quantity ?? "").trim(),
      instructions: String(mappedValues.instructions ?? "").trim(),
      notes: String(mappedValues.notes ?? "").trim(),
    },
  };
}
