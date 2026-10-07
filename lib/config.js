const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL must be set before starting or building the frontend.");
}

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");
