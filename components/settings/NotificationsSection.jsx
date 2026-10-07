"use client";

import { useState, useEffect } from "react";
import SettingsCard from "./SettingsCard";
import SettingsToggle from "./SettingsToggle";
import { getPreferences, updatePreferences } from "../../lib/usersApi";

const notificationSettings = [
  { key: "priceAlerts", label: "Price Alerts" },
  { key: "startupMilestones", label: "Startup Milestones" },
  { key: "newListings", label: "New Listings" },
  { key: "weeklyDigest", label: "Weekly Digest" },
];

export default function NotificationsSection() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPreferences() {
      try {
        const res = await getPreferences();
        const data = res?.settings || res || {};
        if (!cancelled) setPreferences(data?.notifications || {});
      } catch {
        if (!cancelled) setPreferences({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPreferences();
    return () => { cancelled = true; };
  }, []);

  const handleToggle = async (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    try {
      await updatePreferences({ notifications: { [key]: value } });
    } catch {
      setPreferences((prev) => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <SettingsCard>
      <div className="px-[35px] pt-[15px] pb-[4px]">
        <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
          Notifications
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6B54F3] border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col">
          {notificationSettings.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between px-[35px] py-[18px]">
                <p className="text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
                  {item.label}
                </p>
                <SettingsToggle
                  checked={!!preferences[item.key]}
                  onChange={(val) => handleToggle(item.key, val)}
                />
              </div>
              <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
