import { Bookmark, Clock, Star } from "lucide-react";
import { badgeColors } from "./trendingNewsMockData";

export default function NewsListItem({
  badge,
  title,
  description,
  time,
  readTime,
}) {
  const colors = badgeColors[badge] || badgeColors.Funding;

  return (
    <div className="min-h-[108px] h-auto w-full rounded-[14px] border border-[#f0f0f0] bg-white px-[20px] pt-[16px] pb-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-[12px] sm:gap-[20px]">
          <div
            className="inline-flex h-[22px] items-center rounded-md px-[10px] text-[12px] font-medium leading-none"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {badge}
          </div>

          <div className="flex items-center gap-[5px]">
            <Clock className="h-[13px] w-[13px] text-[#9ca3af] dark:text-[#7c8190]" strokeWidth={1.5} />
            <span className="text-[12px] leading-none text-[#9ca3af] dark:text-[#7c8190]">{time}</span>
          </div>

          <span className="text-[12px] leading-none text-[#9ca3af] dark:text-[#7c8190]">{readTime}</span>
        </div>

        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#282d3f]"
            aria-label="Star article"
          >
            <Star className="h-[12px] w-[12px]" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#282d3f]"
            aria-label="Bookmark article"
          >
            <Bookmark className="h-[14px] w-[14px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <h3 className="mt-[12px] text-[15px] font-semibold leading-tight text-[#1a1a2e] truncate dark:text-white">
        {title}
      </h3>

      <p className="mt-[6px] text-[13px] leading-tight text-[#6b7280] truncate dark:text-[#b0b5bf]">
        {description}
      </p>
    </div>
  );
}
