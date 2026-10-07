"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Bell, Loader2 } from "lucide-react";
import { getUnreadCount } from "../../lib/usersApi";
import { connectSocket, onNewNotification } from "../../lib/socketClient";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  // Dedupe: desktop + mobile bells mount simultaneously; without this each
  // push notification would increment twice (once per instance).
  const seenNotificationIds = useRef(new Set());

  // Stable callbacks: inline arrows would create new identities per render,
  // re-triggering ModalPortal/NotificationDropdown effects (flicker).
  const handleCloseDropdown = useCallback(() => setOpen(false), []);
  const handleCountChange = useCallback((count) => setUnread(count), []);

  // Stable handler so StrictMode remount off() removes the exact listener.
  const handlePushNotification = useCallback((notification) => {
    if (!notification || notification?.isRead) return;
    const id = notification?._id || notification?.id;
    if (id) {
      if (seenNotificationIds.current.has(id)) return;
      seenNotificationIds.current.add(id);
      // Bound growth: only recent ids matter for dedupe.
      if (seenNotificationIds.current.size > 200) {
        const first = seenNotificationIds.current.values().next().value;
        seenNotificationIds.current.delete(first);
      }
    }
    setUnread((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getUnreadCount()
      .then((res) => {
        if (!cancelled) setUnread(res?.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const socket = connectSocket();
    let unsub = null;
    if (socket) {
      unsub = onNewNotification(handlePushNotification);
    }
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [handlePushNotification]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close notifications" : "Open notifications"}
        aria-expanded={open}
        className="relative flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-[#f4f5f7] dark:border-[#2a2e3e] dark:bg-[#1c202e] transition-colors duration-150 hover:bg-[#e5e7eb] dark:hover:bg-[#2a2e3e]"
      >
        {loading ? (
          <Loader2 className="h-[15px] w-[15px] animate-spin text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.5} />
        ) : (
          <Bell className="h-[15px] w-[15px] text-[#374151] dark:text-[#b0b5bf]" strokeWidth={1.5} />
        )}
        {unread > 0 && (
          <span className="absolute -right-[5px] -top-[5px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#F0395A] px-[4px] text-[10px] font-bold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          onClose={handleCloseDropdown}
          onCountChange={handleCountChange}
        />
      )}
    </div>
  );
}