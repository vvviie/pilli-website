export const logPrescriptionEvent = ({ event, level = "info", detail }) => {
  const safeDetail = detail
    ? Object.fromEntries(
        Object.entries(detail).filter(([key]) => {
          const lower = key.toLowerCase();
          return !lower.includes("patient") && !lower.includes("name") && !lower.includes("sex");
        }),
      )
    : undefined;

  const line = {
    ts: new Date().toISOString(),
    event,
    level,
    detail: safeDetail,
  };

  if (level === "error") {
    console.error("[pilli-prescription]", line);
    return;
  }

  if (level === "warn") {
    console.warn("[pilli-prescription]", line);
    return;
  }

  console.info("[pilli-prescription]", line);
};
