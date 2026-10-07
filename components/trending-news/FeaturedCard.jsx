import { Bookmark, Clock } from "lucide-react";
import { badgeColors } from "./trendingNewsMockData";

export default function FeaturedCard({
  badge,
  title,
  description,
  time,
  readTime,
}) {
  const colors = badgeColors[badge] || badgeColors.Funding;

  return (
    <div className="relative min-h-[170px] h-auto w-full rounded-[14px] border border-[#f0f0f0] bg-white px-[20px] pt-[16px] pb-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:border-[#2a2e3e] dark:bg-[#181c28] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div
        className="inline-flex h-[22px] items-center rounded-md px-[10px] text-[12px] font-medium leading-none"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {badge}
      </div>

      <button
        type="button"
        className="absolute right-[20px] top-[18px] flex h-[20px] w-[20px] items-center justify-center text-[#374151] transition-colors hover:text-[#111827] dark:text-[#b0b5bf] dark:hover:text-white"
        aria-label="Bookmark"
      >
        <Bookmark className="h-[16px] w-[16px]" strokeWidth={1.5} />
      </button>

      <h3 className="mt-[12px] text-[15px] font-semibold leading-tight text-[#1a1a2e] line-clamp-2 dark:text-white">
        {title}
      </h3>

      <p className="mt-[10px] text-[13px] leading-tight text-[#6b7280] line-clamp-2 dark:text-[#b0b5bf]">
        {description}
      </p>

      <div className="mt-[12px] flex items-center gap-[16px]">
        <div className="flex items-center gap-[5px]">
          <Clock className="h-[13px] w-[13px] text-[#9ca3af] dark:text-[#7c8190]" strokeWidth={1.5} />
          <span className="text-[12px] leading-none text-[#9ca3af] dark:text-[#7c8190]">{time}</span>
        </div>
        <span className="text-[12px] leading-none text-[#9ca3af] dark:text-[#7c8190]">{readTime}</span>
      </div>
    </div>
  );
}
