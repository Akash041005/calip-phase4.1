"use client";

import { useState } from "react";

export default function SettingsToggle({
  defaultOn = false,
  checked,
  onChange,
  disabled = false,
}) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = useState(defaultOn);
  const on = isControlled ? checked : internal;

  const handleClick = () => {
    if (disabled) return;
    if (isControlled) {
      if (typeof onChange === "function") onChange(!checked);
      return;
    }
    setInternal((prev) => !prev);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Toggle setting"
      aria-disabled={disabled}
      onClick={handleClick}
      className={`relative h-[24px] w-[47px] shrink-0 rounded-full transition-colors duration-200 ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${on ? "bg-[#6B54F3]" : "bg-[#d1d5db] dark:bg-[#2a2e3e]"}`}
    >
      <span
        className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white transition-all duration-200 ${
          on ? "left-[25px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}
