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
                ? "bg-white text-black shadow-sm"
                : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
