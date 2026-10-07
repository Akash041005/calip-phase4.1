"use client";

import Link from "next/link";
import Image from "next/image";

const platformLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", href: "/overview" },
  { label: "Auction", href: "/auction/live" },
  { label: "Companies", href: "/companies" },
  { label: "Analytics", href: "/analytics" },
];

const forYouLinks = [
  { label: "For Investors", href: "/overview" },
  { label: "For Startups", href: "/founders" },
  { label: "Join Calip.io", href: "/founders" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Security", href: "#" },
  { label: "Legal", href: "#" },
];

const socialLinks = [
  {
    label: "X (Twitter)",
    href: "https://x.com/InfoCalip",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/calip1/",
    external: true,
  },
];

function FooterLinkList({ links }) {
  return (
    <ul className="mt-4 space-y-2 text-[14px] text-[#6b7280] dark:text-[#9ca3af]" role="list">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#1a1a2e] dark:hover:text-white"
            >
              {link.label}
            </a>
          ) : (
            <Link
              href={link.href}
              className="transition-colors hover:text-[#1a1a2e] dark:hover:text-white"
            >
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-16 sm:mt-24 lg:mt-32 border-t border-[#e5e7eb] dark:border-[#2a2e3e]" role="contentinfo">
      <div
        className="absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)",
        }}
      />

      <div className="mx-auto max-w-[1440px] px-[16px] sm:px-[24px] lg:px-[40px] py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-12">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center">
              <Image
                src="/caliplogo.png"
                alt="Calip.io logo"
                width={86}
                height={36}
                className="h-8 w-auto"
              />
            </div>
            <p className="mt-4 max-w-sm text-[13px] leading-[20px] text-[#6b7280] dark:text-[#9ca3af]">
              Calip.io is the Web3-powered investment platform that connects
              visionary startups with individual investors through verified deal
              flow and AI-driven screening.
            </p>
          </div>

          <nav aria-label="Platform links">
            <h4 className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
              Platform
            </h4>
            <FooterLinkList links={platformLinks} />
          </nav>

          <nav aria-label="For you links">
            <h4 className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
              For You
            </h4>
            <FooterLinkList links={forYouLinks} />
          </nav>

          <nav aria-label="Legal links">
            <h4 className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
              Legal
            </h4>
            <FooterLinkList links={legalLinks} />
          </nav>

          <nav aria-label="Social media links">
            <h4 className="text-[14px] font-semibold text-[#1a1a2e] dark:text-white">
              Connect
            </h4>
            <FooterLinkList links={socialLinks} />
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#e5e7eb] dark:border-[#2a2e3e] pt-6 text-[12px] text-[#9ca3af] md:flex-row md:items-center">
          <small>&copy; 2026 Calip.io &mdash; All rights reserved.</small>
          <span>The Web3 platform connecting startups with smart capital.</span>
        </div>
      </div>
    </footer>
  );
}
