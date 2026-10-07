"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Trash2, Loader2 } from "lucide-react";
import SettingsCard from "./SettingsCard";
import { getSessions, deleteSession } from "../../lib/usersApi";

function ChromeIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="28"
      height="27"
      viewBox="0 0 28 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M11.4648 24.4834C6.24167 23.3674 2.33333 18.8741 2.33333 13.5C2.33333 11.4503 2.9015 9.52875 3.8955 7.87275L8.89233 16.2191C9.45384 17.2002 10.3064 17.9971 11.3407 18.5078C12.375 19.0186 13.544 19.2197 14.6977 19.0856L11.4648 24.4834ZM14 24.75L19.0015 16.3969C19.5462 15.5219 19.8337 14.5205 19.8333 13.5C19.835 12.2827 19.4255 11.0979 18.6667 10.125H25.1323C25.4875 11.2172 25.6677 12.3553 25.6667 13.5C25.6667 19.7134 20.4435 24.75 14 24.75ZM17.0007 15.2381C16.6869 15.7418 16.2423 16.1577 15.7107 16.4449C15.1792 16.732 14.5791 16.8803 13.9698 16.8752C13.3606 16.8701 12.7632 16.7117 12.2369 16.4157C11.7106 16.1197 11.2736 15.6963 10.969 15.1875L10.9352 15.1312C10.6397 14.615 10.4897 14.0331 10.5 13.4436C10.5104 12.854 10.6807 12.2774 10.9941 11.771C11.3074 11.2647 11.7529 10.8464 12.2861 10.5577C12.8193 10.2691 13.4216 10.1201 14.033 10.1258C14.6445 10.1314 15.2437 10.2914 15.7711 10.5899C16.2985 10.8883 16.7355 11.3148 17.0388 11.8268C17.342 12.3388 17.5009 12.9185 17.4995 13.5082C17.4982 14.0978 17.3366 14.6768 17.031 15.1875L17.0007 15.2381ZM5.404 5.89387C6.49551 4.74378 7.82368 3.82574 9.30374 3.19834C10.7838 2.57094 12.3832 2.24795 14 2.25C16.0483 2.24966 18.0605 2.76931 19.8345 3.75672C21.6084 4.74413 23.0815 6.1645 24.1057 7.875H14C12.8573 7.87462 11.7396 8.19789 10.7857 8.80469C9.83185 9.41149 9.08382 10.2751 8.6345 11.2883L5.404 5.89387Z"
        fill="white"
      />
    </svg>
  );
}

const sessionIconMap = {
  chrome: ChromeIcon,
  phone: Smartphone,
  monitor: Monitor,
};

export default function ActiveSessions() {
  const [list, setList] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getSessions()
      .then((res) => {
        const data =
          (Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.sessions)
            ? res.sessions
            : null) || null;
        if (!cancelled && data) {
          setList(
            data.map((s) => ({
              id: s.sessionId || s._id || s.id || String(Math.random()),
              title: s.device || s.title || "Device",
              location: s.location || "Unknown location",
              badge: s.isCurrent ? "Current Session" : null,
              icon: /phone|mobile|iOS|android/i.test(s.device || "")
                ? "phone"
                : "chrome",
            }))
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const sessionList = list || [];

  const handleDelete = async (sessionId) => {
    setRemoving(sessionId);
    try {
      await deleteSession(sessionId);
      setList((prev) => (prev || []).filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <SettingsCard>
      <div className="px-[35px] pt-[15px] pb-[4px]">
        <h2 className="text-[20px] font-bold leading-none text-black dark:text-white">
          Active Sessions
        </h2>
        <p className="mt-[6px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
          Devices currently signed in to your account
        </p>
      </div>

      {sessionList.map((session, index) => {
        const Icon = sessionIconMap[session.icon] || Monitor;

        return (
          <div key={session.id}>
            {index > 0 && (
              <div className="mx-[35px] h-px bg-[#e5e7eb] dark:bg-[#2a2e3e]" />
            )}
            <div className="flex items-center gap-[20px] px-[35px] py-[18px]">
              <div className="flex h-[59px] w-[58px] shrink-0 items-center justify-center rounded-[20px] border border-[#131622] dark:border-[#2a2e3e] bg-[#6450ea] dark:bg-[#5546d4]">
                <Icon className="h-[28px] w-[28px] text-white" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold leading-none text-[#9da3b0] dark:text-[#b0b5bf]">
                  {session.title}
                </p>
                <p className="mt-[4px] text-[14px] leading-none text-[#8791a7] dark:text-[#9ca3af]">
                  {session.location}
                </p>
              </div>
              {session.badge && (
                <span className="flex h-[21px] w-[99px] items-center justify-center rounded-[5px] bg-[#6450ea] text-[9px] font-bold uppercase leading-none tracking-wide text-white">
                  {session.badge}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(session.id)}
                className="flex h-[59px] w-[58px] shrink-0 items-center justify-center rounded-[15px] border border-[#471a2e] bg-[#6450ea] transition-colors hover:bg-[#5741dc]"
                aria-label={`Sign out ${session.title}`}
              >
                {removing === session.id ? (
                  <Loader2 className="h-[24px] w-[24px] animate-spin text-white" strokeWidth={1.5} />
                ) : (
                  <Trash2 className="h-[24px] w-[24px] text-white" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </SettingsCard>
  );
}
