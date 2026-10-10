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
    <div className="min-h-[100px] h-auto w-full rounded-2xl border border-[rgba(226,232,255,0.06)] bg-[#111723]/70 p-4 shadow-sm hover:border-[rgba(129,116,255,0.2)] hover:bg-[#111723]/90 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div
            className="inline-flex h-[20px] items-center rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {badge}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[rgba(226,232,255,0.4)]">
            <Clock className="h-3 w-3 text-[#8174ff]" strokeWidth={1.5} />
            <span>{time}</span>
          </div>

          <span className="text-xs text-[rgba(226,232,255,0.4)]">•</span>
          <span className="text-xs text-[rgba(226,232,255,0.4)]">{readTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(226,232,255,0.08)] bg-[#161f30] text-[rgba(226,232,255,0.5)] hover:text-white hover:border-[rgba(129,116,255,0.3)] transition-colors"
            aria-label="Star article"
          >
            <Star className="h-3 w-3" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(226,232,255,0.08)] bg-[#161f30] text-[rgba(226,232,255,0.5)] hover:text-white hover:border-[rgba(129,116,255,0.3)] transition-colors"
            aria-label="Bookmark article"
          >
            <Bookmark className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <h3 className="mt-2.5 text-sm font-semibold leading-tight text-white truncate">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-[rgba(226,232,255,0.6)] truncate">
        {description}
      </p>
    </div>
  );
}
