import Link from "next/link";

const tabs = [
  { label: "Live", href: "/auction/live" },
  { label: "Upcoming", href: "/auction/upcoming" },
  { label: "Closed", href: "/auction/closed" },
];

export default function AuctionFilterTabs({ activeTab }) {
  return (
    <div className="flex items-center gap-[14px]">
      {tabs.map((tab) => {
        const isActive = tab.label.toLowerCase() === activeTab.toLowerCase();
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`inline-flex h-[30px] items-center rounded-[6px] px-[12px] text-[13px] font-medium leading-none transition-colors ${
              isActive
                ? "bg-[#6366f1] text-white"
                : "border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb] dark:border-[#3a3e4e] dark:bg-[#1c202e] dark:text-[#b0b5bf] dark:hover:bg-[#242838]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
