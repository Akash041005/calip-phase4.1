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
    <div className="relative min-h-[170px] h-auto w-full rounded-2xl border border-[rgba(226,232,255,0.08)] bg-[#111723]/90 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-[rgba(129,116,255,0.25)] transition-all">
      <div
        className="inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {badge}
      </div>

      <button
        type="button"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(226,232,255,0.08)] bg-[#161f30] text-[rgba(226,232,255,0.6)] hover:text-white hover:border-[rgba(129,116,255,0.4)] transition-colors"
        aria-label="Bookmark"
      >
        <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      <h3 className="mt-3 text-base font-bold leading-snug text-white line-clamp-2">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-[rgba(226,232,255,0.6)] line-clamp-2">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-[rgba(226,232,255,0.4)]">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#8174ff]" strokeWidth={1.5} />
          <span>{time}</span>
        </div>
        <span>•</span>
        <span>{readTime}</span>
      </div>
    </div>
  );
}
