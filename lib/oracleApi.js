import { apiFetch } from "./apiClient";
import { isMockEnabled } from "./mock/enabled";
import { mockDelay } from "./mock/delay";

export async function getOracleMetrics(startupId) {
  if (isMockEnabled()) {
    await mockDelay(200);
    return {
      success: true,
      data: {
        startupId,
        valuation: 12500000,
        confidenceScore: 0.94,
        timestamp: Date.now(),
        metrics: {
          revenueRunRate: 1800000,
          growthRateMonthly: 0.18,
          activeUsers: 45000,
        },
      },
    };
  }
  return apiFetch(`/oracle/metrics/${startupId}`);
}

export async function signOraclePayload(startupId, valuation, metrics) {
  if (isMockEnabled()) {
    await mockDelay(300);
    return {
      success: true,
      signature: "0xmocked_oracle_signature",
      nonce: 1,
      startupId,
      valuation,
    };
  }
  return apiFetch("/oracle/payload/sign", {
    method: "POST",
    auth: true,
    body: { startupId, valuation, metrics },
  });
}

export async function getOracleNonce(startupId) {
  if (isMockEnabled()) {
    await mockDelay(150);
    return { success: true, nonce: 1 };
  }
  return apiFetch(`/oracle/nonce/${startupId}`, { auth: true });
}
