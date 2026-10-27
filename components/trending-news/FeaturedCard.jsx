import { Bookmark, Clock } from "lucide-react";
import { badgeColors } from "./badgeColors";

export default function FeaturedCard({
  badge,
  title,
  description,
  time,
  readTime,
}) {
  const colors = badgeColors[badge] || badgeColors.Funding;

  return (
    <div className="cl-card-interactive relative min-h-[170px] h-auto w-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#111318] dark:hover:border-white/20 transition-all">
      <div
        className="inline-flex h-[22px] items-center rounded-md px-2.5 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {badge}
      </div>

      <button
        type="button"
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors"
        aria-label="Bookmark"
      >
        <Bookmark className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>

      <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 transition-colors">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2 transition-colors">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
          <span>{time}</span>
        </div>
        <span>•</span>
        <span>{readTime}</span>
      </div>
    </div>
  );
}
