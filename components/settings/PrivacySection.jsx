"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, Users, Eye, BarChart3 } from "lucide-react";
import SettingsCard from "./SettingsCard";
import SettingsToggle from "./SettingsToggle";
import { getPreferences, updatePreferences } from "../../lib/usersApi";

const privacyConfig = [
  {
    key: "publicProfile",
    title: "Public Profile",
    description: "Anyone can view your profile page",
    Icon: Globe,
  },
  {
    key: "showPortfolioValue",
    title: "Show Portfolio Value",
    description: "Display your holdings and returns publicly",
    Icon: Lock,
  },
  {
    key: "showInvestmentActivity",
    title: "Show Investment Activity",
    description: "Let others see your buys and sells",
    Icon: Users,
  },
  {
    key: "appearInSearch",
    title: "Appear in Search",
    description: "Allow investors to find your profile",
    Icon: Eye,
  },
  {
    key: "analyticsDataSharing",
    title: "Analytics & Data Sharing",
    description: "Share anonymized data to improve Calip",
    Icon: BarChart3,
  },
];

export default function PrivacySection() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPreferences() {
      try {
        const res = await getPreferences();
        const data = res?.settings || res || {};
        if (!cancelled) setPreferences(data?.privacy || {});
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
      await updatePreferences({ privacy: { [key]: value } });
    } catch {
      setPreferences((prev) => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <SettingsCard>
      <div className="pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <h2 className="text-[18px] font-bold text-slate-900 dark:text-white">
          Privacy
        </h2>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Control profile visibility and public investment disclosures.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent" />
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-white/[0.08]">
          {privacyConfig.map((item) => {
            const Icon = item.Icon;
            return (
              <div key={item.key} className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-slate-700 dark:text-white" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
                <SettingsToggle
                  checked={!!preferences[item.key]}
                  onChange={(val) => handleToggle(item.key, val)}
                />
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}
