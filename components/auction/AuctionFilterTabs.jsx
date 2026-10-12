import Link from "next/link";

const tabs = [
  { label: "Live", href: "/auction/live" },
  { label: "Upcoming", href: "/auction/upcoming" },
  { label: "Closed", href: "/auction/closed" },
];

export default function AuctionFilterTabs({ activeTab }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white shadow-xs dark:border-white/[0.08] dark:bg-[#0e1015]">
      {tabs.map((tab) => {
        const isActive = tab.label.toLowerCase() === activeTab.toLowerCase();
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`inline-flex h-[32px] items-center rounded-lg px-4 text-[13px] font-semibold transition-all ${
              isActive
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-black"
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
