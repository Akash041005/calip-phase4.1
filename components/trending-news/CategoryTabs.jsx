const categories = ["All", "Funding", "AI", "DeFi", "ClimaTech", "Regulation", "Market"];

export default function CategoryTabs({ activeCategory = "All", onSelectCategory }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(category)}
            className={`flex h-8 items-center justify-center rounded-lg px-4 text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
                : "bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200/70 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.08] dark:hover:text-white dark:hover:bg-white/[0.08]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
