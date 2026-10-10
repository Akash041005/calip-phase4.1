"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import SettingsCard from "./SettingsCard";
import SettingsToggle from "./SettingsToggle";
import { useAuth } from "../auth/AuthProvider";
import { truncateAddress } from "../../lib/format";
import { updateUserSecurity } from "../../lib/authApi";

const SECURITY_ITEMS = [
  {
    id: 1,
    title: "Change Password",
    description: "Last changed 30 days ago",
    type: "arrow",
  },
  {
    id: 2,
    title: "Two-Factor Authentication",
    description: "Add an extra layer of security",
    type: "toggle",
    cta: "Set up →",
  },
  {
    id: 3,
    title: "Login activity",
    description: "Last login: Today 09:14 AM · India",
    type: "none",
  },
];

export default function SecuritySection() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const twoFactorOn = Boolean(user?.security?.twoFactorAuth);
  const displayTwoFactor = isAuthenticated ? twoFactorOn : true;

  const handleToggle = async (next) => {
    if (!isAuthenticated || saving) return;
    setSaving(true);
    setToggleError(null);
    const previous = twoFactorOn;
    updateUser((prev) => ({
      ...prev,
      security: { ...(prev?.security || {}), twoFactorAuth: next },
    }));
    try {
      await updateUserSecurity({ twoFactorAuth: next });
    } catch (err) {
      updateUser((prev) => ({
        ...prev,
        security: { ...(prev?.security || {}), twoFactorAuth: previous },
      }));
      setToggleError(err?.message || "Could not update security settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderedItems = SECURITY_ITEMS.map((item) => {
    if (item.id === 3 && isAuthenticated && user?.walletAddress) {
      return { ...item, description: `Signed in with ${truncateAddress(user.walletAddress)}` };
    }
    return item;
  });

  return (
    <SettingsCard>
      <div className="pb-4 border-b border-white/[0.08]">
        <h2 className="text-[18px] font-bold text-white">
          Security
        </h2>
        <p className="mt-1 text-[13px] text-slate-400">
          Manage authentication credentials and account safeguards.
        </p>
      </div>

      <div className="divide-y divide-white/[0.08]">
        {renderedItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-white">
                {item.title}
              </p>
              <p className="mt-1 text-[13px] text-slate-400">
                {item.description}
              </p>
              {item.type === "toggle" && toggleError && (
                <p className="mt-1 text-[12px] text-rose-400">
                  {toggleError}
                </p>
              )}
            </div>

            {item.type === "arrow" && (
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" strokeWidth={2} />
            )}

            {item.type === "toggle" && (
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[12px] font-semibold text-emerald-400">
                  {saving ? "Saving…" : displayTwoFactor ? "Enabled" : "Disabled"}
                </span>
                <SettingsToggle
                  checked={displayTwoFactor}
                  onChange={isAuthenticated ? handleToggle : undefined}
                  disabled={saving}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
