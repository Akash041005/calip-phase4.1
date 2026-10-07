export const WALLET_ERROR_CODES = {
  NOT_INSTALLED: "WALLET_NOT_INSTALLED",
  CONNECTION_REJECTED: "CONNECTION_REJECTED",
  CONNECTION_FAILED: "CONNECTION_FAILED",
  SIGNATURE_REJECTED: "SIGNATURE_REJECTED",
  SIGN_FAILED: "SIGN_FAILED",
};

export class WalletError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "WalletError";
    this.code = code;
  }
}

function getInjectedProvider() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function isWalletInstalled() {
  return getInjectedProvider() != null;
}

function isUserRejection(error) {
  if (!error) return false;
  if (error.code === 4001) return true;
  const message = String(error.message || error || "").toLowerCase();
  return (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("request rejected")
  );
}

export async function connectWallet() {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.request !== "function") {
    throw new WalletError(
      WALLET_ERROR_CODES.NOT_INSTALLED,
      "No compatible Ethereum wallet was detected."
    );
  }

  let accounts;
  try {
    accounts = await provider.request({ method: "eth_requestAccounts" });
  } catch (error) {
    if (isUserRejection(error)) {
      throw new WalletError(
        WALLET_ERROR_CODES.CONNECTION_REJECTED,
        "Wallet connection was rejected."
      );
    }
    throw new WalletError(
      WALLET_ERROR_CODES.CONNECTION_FAILED,
      "Could not connect to your wallet."
    );
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new WalletError(
      WALLET_ERROR_CODES.CONNECTION_REJECTED,
      "No wallet account was selected."
    );
  }

  return accounts[0];
}

export async function signWalletMessage(message, address) {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.request !== "function") {
    throw new WalletError(
      WALLET_ERROR_CODES.NOT_INSTALLED,
      "No compatible Ethereum wallet was detected."
    );
  }

  let signature;
  try {
    signature = await provider.request({
      method: "personal_sign",
      params: [message, address],
    });
  } catch (error) {
    if (isUserRejection(error)) {
      throw new WalletError(
        WALLET_ERROR_CODES.SIGNATURE_REJECTED,
        "Signature was rejected."
      );
    }
    throw new WalletError(
      WALLET_ERROR_CODES.SIGN_FAILED,
      "Could not sign the message."
    );
  }

  if (typeof signature !== "string" || !signature.startsWith("0x")) {
    throw new WalletError(
      WALLET_ERROR_CODES.SIGN_FAILED,
      "Your wallet returned an invalid signature."
    );
  }

  return signature;
}

export function subscribeToAccountsChanged(handler) {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.on !== "function") return () => {};
  provider.on("accountsChanged", handler);
  return () => {
    if (typeof provider.removeListener === "function") {
      provider.removeListener("accountsChanged", handler);
    }
  };
}

export function subscribeToDisconnect(handler) {
  const provider = getInjectedProvider();
  if (!provider || typeof provider.on !== "function") return () => {};
  provider.on("disconnect", handler);
  return () => {
    if (typeof provider.removeListener === "function") {
      provider.removeListener("disconnect", handler);
    }
  };
}
