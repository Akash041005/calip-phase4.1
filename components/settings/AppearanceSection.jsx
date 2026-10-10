"use client";

import { Sun, Moon, Check, Sparkles } from "lucide-react";
import SettingsCard from "./SettingsCard";
import SettingsToggle from "./SettingsToggle";
import { useTheme } from "../auth/ThemeProvider";

export default function AppearanceSection() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <SettingsCard>
      <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.08] text-white border border-white/10">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-[18px] font-bold text-[#0f172a] dark:text-white">
                Appearance & Theme
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-[#64748b] dark:text-[#94a3b8]">
              Customize the visual interface style of your Calip trading workspace.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-medium text-[#64748b] dark:text-[#94a3b8]">
              {isDark ? "Dark Mode Active" : "Light Mode Active"}
            </span>
            <SettingsToggle
              checked={isDark}
              onChange={toggleTheme}
            />
          </div>
        </div>
      </div>

      {/* Visual Theme Selectors */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dark Theme Card */}
        <button
          type="button"
          onClick={() => {
            if (!isDark) toggleTheme();
          }}
          className={`group relative flex flex-col items-start rounded-xl p-4 text-left transition-all duration-200 border ${
            isDark
              ? "border-white/30 bg-white/[0.06] shadow-lg"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
          }`}
        >
          {/* Mock Visual Preview */}
          <div className="w-full h-24 rounded-lg bg-[#090a0f] border border-white/[0.08] p-2.5 flex flex-col justify-between overflow-hidden relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              </div>
              <div className="h-2 w-10 bg-white/20 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-2/3 bg-white/30 rounded-full" />
              <div className="h-2 w-1/2 bg-white/10 rounded-full" />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-[#10b981]">
              <span>+$3,450.00</span>
              <span className="text-[#10b981]">▲ 24.5%</span>
            </div>
          </div>

          <div className="mt-3 flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className={`h-4 w-4 ${isDark ? "text-white" : "text-[#94a3b8]"}`} />
              <span className="text-[14px] font-semibold text-white">
                Dark Mode
              </span>
            </div>
            {isDark && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            Optimized for low-light environments and long trading sessions. (Recommended)
          </p>
        </button>

        {/* Light Theme Card */}
        <button
          type="button"
          onClick={() => {
            if (isDark) toggleTheme();
          }}
          className={`group relative flex flex-col items-start rounded-xl p-4 text-left transition-all duration-200 border ${
            !isDark
              ? "border-white/30 bg-white/[0.06] shadow-lg"
              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
          }`}
        >
          {/* Mock Visual Preview */}
          <div className="w-full h-24 rounded-lg bg-[#ffffff] border border-black/[0.1] p-2.5 flex flex-col justify-between overflow-hidden relative shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
                <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              </div>
              <div className="h-2 w-10 bg-black/15 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-2/3 bg-black/40 rounded-full" />
              <div className="h-2 w-1/2 bg-black/10 rounded-full" />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-[#10b981]">
              <span>+$3,450.00</span>
              <span className="text-[#10b981]">▲ 24.5%</span>
            </div>
          </div>

          <div className="mt-3 flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${!isDark ? "text-white" : "text-[#94a3b8]"}`} />
              <span className="text-[14px] font-semibold text-white">
                Light Mode
              </span>
            </div>
            {!isDark && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-[#94a3b8]">
            High-clarity daylight theme with clean contrast and bright surfaces.
          </p>
        </button>
      </div>
    </SettingsCard>
  );
}
