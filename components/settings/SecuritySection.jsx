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
      <div className="px-[35px] pt-[15px] pb-[4px]">
        <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
          Security
        </h2>
      </div>

      {renderedItems.map((item, index) => (
        <div key={item.id}>
          {index > 0 && (
            <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />
          )}
          <div className="flex items-center justify-between px-[35px] py-[18px]">
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-semibold leading-none text-black dark:text-white">
                {item.title}
              </p>
              <p className="mt-[6px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
                {item.description}
              </p>
              {item.type === "toggle" && toggleError && (
                <p className="mt-[6px] text-[12px] leading-none text-[#F0395A]">
                  {toggleError}
                </p>
              )}
            </div>

            {item.type === "arrow" && (
              <ChevronRight className="h-[27px] w-[14px] shrink-0 text-[#6878A0]" strokeWidth={3} />
            )}

            {item.type === "toggle" && (
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[12px] font-semibold leading-none text-[#7C5CFC]">
                  {saving ? "Saving…" : displayTwoFactor ? "Enabled" : "Set up →"}
                </span>
                <SettingsToggle
                  checked={displayTwoFactor}
                  onChange={isAuthenticated ? handleToggle : undefined}
                  disabled={saving}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </SettingsCard>
  );
}
