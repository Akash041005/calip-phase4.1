import Link from "next/link";

const tabs = [
  { label: "Live", href: "/auction/live" },
  { label: "Upcoming", href: "/auction/upcoming" },
  { label: "Closed", href: "/auction/closed" },
];

export default function AuctionFilterTabs({ activeTab }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-md">
      {tabs.map((tab) => {
        const isActive = tab.label.toLowerCase() === activeTab.toLowerCase();
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`inline-flex h-[32px] items-center rounded-full px-4 text-[13px] font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#6a60e7]/30 to-[#8174ff]/30 border border-[#8174ff]/50 text-white shadow-[0_0_14px_rgba(129,116,255,0.22)]"
                : "text-[#a6adbf] hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
