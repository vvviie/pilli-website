const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const readWithRetry = async ({ label, performFetch, maxAttempts = 4 }) => {
  let attempt = 0;
  let delayMs = 300;

  while (attempt < maxAttempts) {
    attempt += 1;
    const response = await performFetch();

    if (response.status !== 429) {
      return response;
    }

    if (attempt >= maxAttempts) {
      return response;
    }

    await sleep(delayMs);
    delayMs = Math.min(delayMs * 2, 2000);
  }

  throw new Error(`${label}: exhausted retries without response`);
};
