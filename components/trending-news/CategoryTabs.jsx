const categories = ["All", "Funding", "AI", "DeFi", "ClimaTech", "Regulation", "Market"];

export default function CategoryTabs({ activeCategory = "All", onSelectCategory }) {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(category)}
            className={`flex h-[32px] items-center justify-center rounded-lg px-[14px] text-[13px] font-medium leading-none transition-colors ${
              isActive
                ? "bg-[#6366f1] text-white"
                : "bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#282d3f]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
