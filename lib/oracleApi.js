import { apiFetch } from "./apiClient";

export async function getOracleMetrics(startupId) {
  return apiFetch(`/oracle/metrics/${startupId}`);
}

export async function signOraclePayload(startupId, valuation, metrics) {
  return apiFetch("/oracle/payload/sign", {
    method: "POST",
    auth: true,
    body: { startupId, valuation, metrics },
  });
}

export async function getOracleNonce(startupId) {
  return apiFetch(`/oracle/nonce/${startupId}`, { auth: true });
}
