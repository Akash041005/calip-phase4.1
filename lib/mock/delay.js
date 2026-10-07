// Simulated network latency so loading/empty/error states stay honest.
export async function mockDelay(ms = 300) {
  const wait = Math.max(0, Math.min(ms, 800));
  await new Promise((resolve) => setTimeout(resolve, wait));
}
