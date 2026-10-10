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
            className={`flex h-8 items-center justify-center rounded-full px-4 text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#6a60e7] to-[#8174ff] text-white shadow-[0_4px_16px_rgba(106,96,231,0.35)]"
                : "bg-[#111723] text-[rgba(226,232,255,0.6)] border border-[rgba(226,232,255,0.08)] hover:text-white hover:border-[rgba(129,116,255,0.3)]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
