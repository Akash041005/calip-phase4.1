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
      <div className="px-[35px] pt-[15px] pb-[4px]">
        <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
          Privacy
        </h2>
        <p className="mt-[6px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
          Control what others can see about you
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6B54F3] border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col">
          {privacyConfig.map((item, index) => {
            const Icon = item.Icon;
            return (
              <div key={item.key}>
                {index > 0 && (
                  <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />
                )}
                <div className="flex items-center gap-[20px] px-[35px] py-[18px]">
                  <div className="flex h-[59px] w-[58px] shrink-0 items-center justify-center rounded-[20px] border border-[#131622] dark:border-[#2a2e3e] bg-[#6450ea] dark:bg-[#5546d4]">
                    <Icon className="h-[28px] w-[28px] text-white" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold leading-none text-[#9da3b0] dark:text-[#b0b5bf]">
                      {item.title}
                    </p>
                    <p className="mt-[4px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
                      {item.description}
                    </p>
                  </div>
                  <SettingsToggle
                    checked={!!preferences[item.key]}
                    onChange={(val) => handleToggle(item.key, val)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SettingsCard>
  );
}
