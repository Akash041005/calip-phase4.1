import { ArrowRight, Bookmark, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getPortfolioActivity } from "../../lib/portfolioApi";

const iconMap = {
  "trending-up": TrendingUp,
  bookmark: Bookmark,
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  refunded: "Refunded",
};

function formatActivityDate(value) {
  if (!value) return "recent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recent";
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function iconKeyForType(type) {
  return type === "watchlist" ? "bookmark" : "trending-up";
}

export default function RecentActivity() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPortfolioActivity()
      .then((res) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : null;
        if (!cancelled && list && list.length > 0) {
          setItems(
            list.map((item) => {
              const presale = item.presaleId || {};
              const statusLabel =
                STATUS_LABELS[item.status] || "Participation";
              const amount =
                typeof item.amount === "number" ? item.amount : null;
              return {
                id: item._id || presale._id || String(Math.random()),
                title:
                  presale.title || item.startupName || "Activity",
                subtitle: `${statusLabel} · ${item.tokens ?? 0} tokens`,
                amount:
                  amount != null
                    ? `\u20B9${amount.toLocaleString("en-IN")}`
                    : null,
                time: formatActivityDate(item.createdAt),
                icon: iconKeyForType(item.type),
              };
            })
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const activityData = items && items.length > 0 ? items : [];

  return (
    <div className="min-h-[260px] w-full rounded-[14px] border border-[#f0f0f0] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#242838] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col p-[24px]">
        <div className="mb-[8px] flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#1a1a2e] dark:text-white">Recent Activity</h2>
          <button
            type="button"
            className="flex items-center gap-1 text-[13px] font-medium text-[#6366f1] transition-colors hover:text-[#5558e3]"
          >
            View all
            <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col">
          {activityData.map((item, index) => {
            const IconComponent = iconMap[item.icon] || TrendingUp;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between py-[8px] ${
                  index < activityData.length - 1
                    ? "border-b border-[#f3f4f6] dark:border-[#242838]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] dark:bg-[#1c202e]">
                    <IconComponent
                      className={`h-[18px] w-[18px] ${
                        item.icon === "bookmark"
                          ? "text-[#374151] dark:text-[#b0b5bf]"
                          : "text-[#7c6cf0] dark:text-[#9485f5]"
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold leading-tight text-[#1a1a2e] dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-[1px] text-[12px] text-[#9ca3af] dark:text-[#7c8190]">{item.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  {item.amount && (
                    <p className="text-[13px] font-medium text-[#7c6cf0] dark:text-[#9485f5]">{item.amount}</p>
                  )}
                  <p
                    className={`text-[12px] text-[#9ca3af] dark:text-[#7c8190] ${
                      item.amount ? "mt-[1px]" : ""
                    }`}
                  >
                    {item.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
