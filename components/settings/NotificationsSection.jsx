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
      <div className="pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Configure real-time deal alerts and platform notifications.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
          {notificationSettings.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4">
              <p className="text-[14px] font-medium text-slate-900 dark:text-white">
                {item.label}
              </p>
              <SettingsToggle
                checked={!!preferences[item.key]}
                onChange={(val) => handleToggle(item.key, val)}
              />
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
