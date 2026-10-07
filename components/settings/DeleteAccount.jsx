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
    <SettingsCard className="bg-[#6450ea]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-[35px] py-[20px]">
        <div>
          <p className="text-[14px] sm:text-[16px] font-semibold leading-none text-[#e9edf6]">
            Delete account
          </p>
          <p className="mt-[6px] text-[12px] sm:text-[14px] leading-none text-white">
            Permanently delete your account and all data
          </p>
          {error && (
            <p className="mt-[6px] text-[12px] leading-none text-[#ffd0d8]">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="flex h-[40px] w-full sm:w-[135px] items-center justify-center gap-[6px] rounded-[15px] border border-[#471a2e] bg-white text-[14px] sm:text-[16px] font-semibold text-[#F0395A] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy && <Loader2 className="h-[16px] w-[16px] animate-spin" strokeWidth={2} />}
          {busy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </SettingsCard>
  );
}
