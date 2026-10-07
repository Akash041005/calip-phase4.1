"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Megaphone,
  Newspaper,
  Package,
  TrendingUp,
  CheckCheck,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../../lib/usersApi";

const typeIcons = {
  price_alert: TrendingUp,
  news: Newspaper,
  system: Bell,
  trade: Package,
};

function typeLabel(type) {
  switch (type) {
    case "price_alert":
      return "Price alert";
    case "news":
      return "News";
    case "trade":
      return "Trade";
    default:
      return "System";
  }
}

export default function NotificationDropdown({ onClose, onCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [now, setNow] = useState(0);
  // Ref avoids re-subscribing the fetch effect when parent passes a new
  // inline onCountChange identity per render (previously hidden with
  // eslint-disable + stale closure flicker).
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    let cancelled = false;
    getNotifications(1, 20)
      .then((res) => {
        if (cancelled) return;
        const list = res?.notifications || (Array.isArray(res) ? res : []);
        setItems(list.filter(Boolean));
        setNow(Date.now());
        const unreadCount = list.filter((n) => !n?.isRead).length;
        onCountChangeRef.current?.(unreadCount);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setNow(Date.now());
        onCountChangeRef.current?.(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Update relative timestamps every 30s without re-fetching.
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const handleRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      const unreadCount = items.filter((n) => n._id !== id && !n?.isRead).length;
      onCountChange?.(unreadCount);
    } catch {
      // Ignore
    }
  };

  const handleReadAll = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onCountChange?.(0);
    } catch {
      // Ignore
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setRemoving(id);
    try {
      await deleteNotification(id);
      const remaining = items.filter((n) => n._id !== id);
      setItems(remaining);
      onCountChange?.(remaining.filter((n) => !n.isRead).length);
    } catch {
      // Ignore
    } finally {
      setRemoving(null);
    }
  };

  const formatTime = (value, referenceNow) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diff = Math.max(0, (referenceNow || 0) - date.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="absolute right-0 max-sm:-right-2 top-[36px] z-[60] w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] dark:border-[#2a2e3e] dark:bg-[#141620] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] sm:w-[400px]">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-[16px] py-[12px] dark:border-[#2a2e3e]">
        <div className="flex items-center gap-2">
          <Bell className="h-[16px] w-[16px] text-[#4f46e5]" strokeWidth={2} />
          <h3 className="text-[15px] font-semibold text-black dark:text-white">Notifications</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReadAll}
            disabled={busy || items.every((n) => n.isRead)}
            className="flex items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-medium text-[#4f46e5] transition-colors hover:bg-[#eef2ff] dark:text-[#818cf8] dark:hover:bg-[#1e1b4b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-[12px] w-[12px] animate-spin" strokeWidth={2} />
            ) : (
              <CheckCheck className="h-[12px] w-[12px]" strokeWidth={2} />
            )}
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#6b7280] transition-colors hover:bg-[#f3f4f6] dark:text-[#9ca3af] dark:hover:bg-[#1e2234]"
          >
            <X className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto" data-lenis-prevent>
        {loading ? (
          <div className="flex items-center justify-center py-[48px]">
            <Loader2 className="h-[22px] w-[22px] animate-spin text-[#4f46e5]" strokeWidth={2} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-[8px] px-[20px] py-[48px] text-center">
            <Megaphone className="h-[28px] w-[28px] text-[#d1d5db] dark:text-[#374151]" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-[#6b7280] dark:text-[#9ca3af]">
              No notifications yet
            </p>
            <p className="text-[12px] text-[#9ca3af] dark:text-[#7c8190]">
              Updates about your auctions, trades, and market news will appear here.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = typeIcons[item.type] || Bell;
            const unread = !item.isRead;
            return (
              <div
                key={item._id}
                className={`group flex items-start gap-[12px] border-b border-[#f3f4f6] px-[16px] py-[14px] transition-colors hover:bg-[#f9fafb] dark:border-[#242838] dark:hover:bg-[#181c28] ${
                  unread ? "bg-[#fbfbff] dark:bg-[#171a26]" : ""
                }`}
              >
                <div
                  className={`mt-[2px] flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] ${
                    unread
                      ? "bg-[#eef2ff] text-[#4f46e5] dark:bg-[#1e1b4b] dark:text-[#818cf8]"
                      : "bg-[#f3f4f6] text-[#9ca3af] dark:bg-[#1e2234] dark:text-[#6b7280]"
                  }`}
                >
                  <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-[#7c8190]">
                      {typeLabel(item.type)}
                    </span>
                    <span className="shrink-0 text-[11px] text-[#9ca3af] dark:text-[#7c8190]">
                      {formatTime(item.createdAt || item.updatedAt, now)}
                    </span>
                  </div>
                  <p className="mt-[2px] text-[13px] font-semibold leading-[18px] text-[#1a1a2e] dark:text-white">
                    {item.title}
                  </p>
                  {item.message && (
                    <p className="mt-[2px] line-clamp-2 text-[12px] leading-[17px] text-[#6b7280] dark:text-[#9ca3af]">
                      {item.message}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-[4px] opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  {unread && (
                    <button
                      type="button"
                      onClick={(e) => handleRead(item._id, e)}
                      aria-label="Mark as read"
                      className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[#4f46e5] transition-colors hover:bg-[#eef2ff] dark:text-[#818cf8] dark:hover:bg-[#1e1b4b]"
                    >
                      <CheckCheck className="h-[14px] w-[14px]" strokeWidth={2} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item._id, e)}
                    disabled={removing === item._id}
                    aria-label="Delete notification"
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[#f0395a] transition-colors hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#3b1420]"
                  >
                    {removing === item._id ? (
                      <Loader2 className="h-[14px] w-[14px] animate-spin" strokeWidth={2} />
                    ) : (
                      <Trash2 className="h-[14px] w-[14px]" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}