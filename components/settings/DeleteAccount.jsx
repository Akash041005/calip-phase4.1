"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { deleteAccount } from "../../lib/usersApi";
import { useAuth } from "../auth/AuthProvider";

export default function DeleteAccount() {
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (busy) return;
    const ok = window.confirm(
      "Are you sure you want to permanently delete your account and all data? This cannot be undone."
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      await logout();
    } catch (err) {
      setError(err?.message || "Could not delete your account. Please try again.");
      setBusy(false);
    }
  };

  return (
    <SettingsCard className="border-rose-500/20 bg-[#111318]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div>
          <p className="text-[16px] font-semibold text-white">
            Delete Account
          </p>
          <p className="mt-1 text-[13px] text-slate-400">
            Permanently delete your account and all associated trading data.
          </p>
          {error && (
            <p className="mt-2 text-[12px] text-rose-400">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="flex h-[38px] w-full sm:w-auto px-5 items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-[13.5px] font-medium text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-[15px] w-[15px] animate-spin" strokeWidth={2} />}
          {busy ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </SettingsCard>
  );
}
