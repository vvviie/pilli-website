import drugSamples from "../../drug_samples.json";

const normalizedDrugSamples = drugSamples.filter(
  (drugRecord) => Boolean(drugRecord?.drugName) && Boolean(drugRecord?.drugDosage),
);

const drugNameOptions = [...new Set(normalizedDrugSamples.map((drugRecord) => drugRecord.drugName))];

const dosageOptionsByDrugName = normalizedDrugSamples.reduce((dosageOptionsMap, drugRecord) => {
  const nextDosageOptionsMap = dosageOptionsMap;
  if (!nextDosageOptionsMap[drugRecord.drugName]) {
    nextDosageOptionsMap[drugRecord.drugName] = [];
  }

  if (!nextDosageOptionsMap[drugRecord.drugName].includes(drugRecord.drugDosage)) {
    nextDosageOptionsMap[drugRecord.drugName].push(drugRecord.drugDosage);
  }

  return nextDosageOptionsMap;
}, {});

const allDosageOptions = [...new Set(normalizedDrugSamples.map((drugRecord) => drugRecord.drugDosage))];

const prescriptionDrugCatalog = {
  drugNameOptions,
  readDosageOptionsFromDrugName(drugName) {
    if (!drugName) {
      return allDosageOptions;
    }

    return dosageOptionsByDrugName[drugName] ?? [];
  },
  readDefaultDosageFromDrugName(drugName) {
    const dosageOptions = this.readDosageOptionsFromDrugName(drugName);
    return dosageOptions[0] ?? "";
  },
};

export default prescriptionDrugCatalog;
