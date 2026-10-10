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
    <div className="min-h-[100px] h-auto w-full rounded-2xl border border-white/[0.08] bg-[#111318] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div
            className="inline-flex h-[20px] items-center rounded-md px-2.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {badge}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3 text-slate-400" strokeWidth={1.5} />
            <span>{time}</span>
          </div>

          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">{readTime}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Star article"
          >
            <Star className="h-3 w-3" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Bookmark article"
          >
            <Bookmark className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <h3 className="mt-2.5 text-sm font-semibold leading-tight text-white truncate">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-relaxed text-slate-400 truncate">
        {description}
      </p>
    </div>
  );
}
