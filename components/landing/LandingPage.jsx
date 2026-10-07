"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  Menu,
  Search,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { MOCK_STARTUPS } from "../../lib/mock/startups";
import { mockAddToWatchlist, mockRemoveFromWatchlist } from "../../lib/mock/watchlist";
import { isMockEnabled } from "../../lib/mock/enabled";
import { AUTH_STATUS, useAuth } from "../auth/AuthProvider";

const assets = "/landing";
const watchlistKey = "calip.watchlist.v1";
const initialWatchlist = ["mock-nova-pay", "mock-voltgrid", "mock-fleetai"];

function getWorkspaceDestination() {
  if (typeof window === "undefined") return "/dashboard";
  try {
    const path = window.sessionStorage.getItem("calip.auth.returnTo");
    window.sessionStorage.removeItem("calip.auth.returnTo");
    if (path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) return path;
  } catch {
    // Use the dashboard when browser storage is unavailable.
  }
  return "/dashboard";
}

function subscribeToWatchlist(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("calip-watchlist-updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("calip-watchlist-updated", callback);
  };
}

function getWatchlistSnapshot() {
  try {
    const raw = window.localStorage.getItem(watchlistKey);
    const ids = raw === null ? initialWatchlist : JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string").join("|") : "";
  } catch {
    return "";
  }
}
const navItems = [
  ["Discover", "#opportunities"],
];
const sectors = ["All sectors", "FinTech", "CleanTech", "AI & ML", "HealthTech", "SpaceTech", "AgriTech"];
const features = [
  {
    eyebrow: "Verified startup discovery",
    title: "Get to know the company behind the idea.",
    copy: "Explore startup profiles with company insights, traction signals, and valuation references in one place.",
    video: "radar.mp4",
    poster: "preview-radar-uhd.jpg",
    action: "Explore startups",
    href: "#opportunities",
  },
  {
    eyebrow: "Startup Performance Tokens",
    title: "A new way to follow startup progress.",
    copy: "Calip is building a marketplace for Startup Performance Tokens. The marketplace is coming soon; this site is a product preview.",
    video: "auction-purchase.mp4",
    poster: "preview-dealroom-uhd.jpg",
    action: "Preview opportunities",
    href: "#opportunities",
  },
  {
    eyebrow: "AI startup analysis",
    title: "Make company signals easier to read.",
    copy: "Explore AI-assisted summaries, growth indicators, and performance intelligence designed to support your research.",
    video: "screening.mp4",
    poster: "preview-screening-uhd.jpg",
    action: "Open Calip analytics",
    href: "#opportunities",
  },
];
const faqs = [
  {
    q: "What is Calip building?",
    a: "Calip is building a Web3 platform for startup discovery, AI-assisted company insights, and Startup Performance Tokens. This site uses illustrative data to preview the product experience.",
  },
  {
    q: "Do I need a wallet to browse Calip?",
    a: "The landing page is public. You must connect your wallet and sign a one-time message before entering the Calip workspace.",
  },
  {
    q: "Are Startup Performance Tokens available to trade now?",
    a: "The reference site lists the token marketplace as coming soon. This product preview does not create, buy, sell, or transfer tokens, and its company data is illustrative.",
  },
  {
    q: "Do Startup Performance Tokens represent company equity?",
    a: "The Calip reference site says these tokens do not represent equity ownership, voting rights, dividend rights, or legal ownership in a startup.",
  },
  {
    q: "How are startups reviewed for listing?",
    a: "Calip describes a structured onboarding and verification process that may consider company registration, founder verification, business traction, operating history, valuation references, and eligibility.",
  },
  {
    q: "How do founders get started?",
    a: "Contact hello@calip.io to ask about sharing your startup on Calip.",
  },
];

function compactMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  if (Math.abs(num) >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `$${formatted}B`;
  }
  if (Math.abs(num) >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `$${formatted}M`;
  }
  if (Math.abs(num) >= 1_000) {
    const formatted = (num / 1_000).toFixed(1).replace(/\.0$/, "");
    return `$${formatted}K`;
  }
  return `$${num.toLocaleString("en-US")}`;
}

function initials(name = "Calip") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function VideoBackground({ src, poster, className = "", eager = false }) {
  return (
    <video
      className={className}
      loop
      muted
      playsInline
      preload="none"
      poster={eager ? `${assets}/${poster}` : undefined}
      aria-hidden="true"
      data-background-video
      data-video-src={`${assets}/${src}`}
      data-poster-src={`${assets}/${poster}`}
    >
    </video>
  );
}

function CompanyCard({ company, saved, onSave, onOpen }) {
  return (
    <article className="cl-company-card">
      <div className="cl-company-identity">
        <span className={`cl-company-mark cl-mark-${(company.symbol || "cal").slice(0, 3).toLowerCase()}`}>
          {initials(company.startupName)}
        </span>
        <div className="cl-company-title-info">
          <p className="cl-company-sector">{company.industrySector || company.category || "Technology"}</p>
          <h3>{company.startupName}</h3>
        </div>
      </div>
      <p className="cl-company-description">{company.description}</p>
      <div className="cl-company-meta">
        <span className="cl-meta-stage">{company.startupStage || "Early stage"}</span>
        <span className="cl-meta-val">{compactMoney(company.currentStartupValuation)} valuation</span>
      </div>
      <div className="cl-company-actions">
        <button className="cl-card-link" type="button" onClick={() => onOpen(company)}>
          View company <ArrowRight size={15} />
        </button>
        <button
          className={`cl-icon-button ${saved ? "is-saved" : ""}`}
          type="button"
          onClick={() => onSave(company._id)}
          aria-label={saved ? `Remove ${company.startupName} from watchlist` : `Save ${company.startupName} to watchlist`}
          aria-pressed={saved}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All sectors");
  const watchlistSnapshot = useSyncExternalStore(subscribeToWatchlist, getWatchlistSnapshot, () => "");
  const watchlist = watchlistSnapshot ? watchlistSnapshot.split("|") : [];
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const [allocationOpen, setAllocationOpen] = useState(false);
  const [allocation, setAllocation] = useState(2500);
  const [allocationSaved, setAllocationSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState("");
  const searchInputRef = useRef(null);
  const gridViewportRef = useRef(null);
  const [gridAtBottom, setGridAtBottom] = useState(false);
  const router = useRouter();
  const { walletAddress, status, error, clearError, connectAndAuthenticate, logout } = useAuth();
  const isConnecting = [AUTH_STATUS.CONNECTING, AUTH_STATUS.SIGNING, AUTH_STATUS.AUTHENTICATING].includes(status);
  const connectionLabel = status === AUTH_STATUS.CONNECTING ? "Connecting wallet" : status === AUTH_STATUS.SIGNING ? "Approve sign-in" : status === AUTH_STATUS.AUTHENTICATING ? "Verifying wallet" : "Connect wallet";
  const sampleWallet = walletAddress || "";

  useEffect(() => {
    const videos = [...document.querySelectorAll("[data-background-video]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prepareVideo = (video) => {
      if (video.dataset.ready) return;
      video.poster = video.dataset.posterSrc;
      const source = document.createElement("source");
      source.src = video.dataset.videoSrc;
      source.type = "video/mp4";
      video.appendChild(source);
      video.dataset.ready = "true";
      if (!reducedMotion) video.load();
    };
    if (!("IntersectionObserver" in window)) {
      videos.forEach((video) => {
        prepareVideo(video);
        if (!reducedMotion) video.play().catch(() => {});
      });
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          prepareVideo(target);
          if (!reducedMotion) target.play().catch(() => {});
        } else if (!reducedMotion) target.pause();
      }),
      { rootMargin: "320px 0px" },
    );
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedCompany(null);
        setWalletOpen(false);
        setAllocationOpen(false);
        setMenuOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const companies = useMemo(() => {
    const search = query.trim().toLowerCase();
    return MOCK_STARTUPS.filter((company) => {
      const matchesSector = sector === "All sectors" || company.industrySector === sector;
      const haystack = `${company.startupName} ${company.industrySector} ${company.startupStage} ${company.description}`.toLowerCase();
      return matchesSector && (!search || haystack.includes(search));
    });
  }, [query, sector]);

  // Reset viewport scroll & bottom-state whenever filter/query changes
  useEffect(() => {
    setGridAtBottom(false);
    if (gridViewportRef.current) gridViewportRef.current.scrollTop = 0;
  }, [sector, query]);

  // Track whether user has scrolled to the bottom of the grid viewport
  useEffect(() => {
    const el = gridViewportRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      setGridAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 16);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [companies]);

  function toggleSaved(id) {
    const isSaved = watchlist.includes(id);
    if (isSaved) mockRemoveFromWatchlist(id);
    else mockAddToWatchlist(id);
    window.dispatchEvent(new Event("calip-watchlist-updated"));
    setToast(isSaved ? "Removed from your watchlist" : "Saved to your watchlist");
  }

  async function connectSampleWallet() {
    if (walletAddress) {
      setWalletOpen(false);
      router.push(getWorkspaceDestination());
      return;
    }
    clearError();
    const connected = await connectAndAuthenticate();
    if (!connected) {
      setToast("Wallet connection was not completed");
      return;
    }
    setWalletOpen(false);
    router.push(getWorkspaceDestination());
  }

  async function disconnectSampleWallet() {
    await logout();
    setWalletOpen(false);
    setToast("Wallet disconnected");
  }

  function submitEmail(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <div className="calip-landing">
      <header className="cl-nav">
        <div className="cl-nav-inner">
          <Link href="/" className="cl-brand" aria-label="Calip home">
            <Image src={`${assets}/caliplogo.png`} alt="Calip" width={98} height={34} priority className="cl-brand-logo" />
          </Link>
          <nav className="cl-nav-links" aria-label="Main navigation">
            {navItems.map(([label, href]) => href.startsWith("/") ? (
              <Link key={label} href={href}>{label}</Link>
            ) : (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <div className="cl-nav-actions">
            <button className="cl-wallet-button" type="button" onClick={() => { clearError(); setWalletOpen(true); }}>
              <Wallet size={16} /> {sampleWallet ? `${sampleWallet.slice(0, 6)}...${sampleWallet.slice(-4)}` : "Connect wallet"}
            </button>
            <button
              className="cl-menu-button"
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="cl-mobile-menu" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => href.startsWith("/") ? (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={15} /></Link>
            ) : (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowDownRight size={15} /></a>
            ))}
            <button type="button" onClick={() => { setMenuOpen(false); clearError(); setWalletOpen(true); }}>
              {sampleWallet ? "Wallet settings" : "Connect wallet"}<Wallet size={15} />
            </button>
          </nav>
        )}
      </header>

      <main id="main">
        <section className="cl-hero" aria-labelledby="cl-hero-title">
          <VideoBackground src="_ref-hero.mp4" poster="preview-hero-uhd.jpg" className="cl-hero-video" eager />
          <div className="cl-hero-shade" />
          <div className="cl-hero-grid" aria-hidden="true" />
          <div className="cl-shell cl-hero-content">
            <div className="cl-hero-copy">
              <p className="cl-eyebrow"><span className="cl-live-dot" /> A clearer view of private markets</p>
              <h1 id="cl-hero-title">Discover. Research.<br /><span>Startup opportunities.</span></h1>
              <p className="cl-hero-subtitle">Explore startup profiles, review AI-assisted company insights, and follow Calip’s vision for a more accessible startup ecosystem.</p>
              <div className="cl-hero-actions">
                <a className="cl-button cl-button-primary" href="#opportunities">Explore startups <ArrowRight size={17} /></a>
              </div>
              <div className="cl-hero-proof">
                <span className="cl-proof-avatars"><i>A</i><i>V</i><i>M</i></span>
                <span>Research, discovery, and portfolio insights in one place</span>
              </div>
            </div>
            <div className="cl-hero-product" aria-label="Calip market workspace preview">
              <div className="cl-preview-window">
                  <div className="cl-preview-topbar"><span className="cl-window-lights"><i /><i /><i /></span><span>app.calip.io <b>/</b> discover</span><span className="cl-preview-status"><i /> PREVIEW</span></div>
                <div className="cl-preview-body">
                  <div className="cl-preview-heading"><span>STARTUP ECOSYSTEM</span><span>Product overview</span></div>
                  <div className="cl-preview-metrics">
                    <div><span>Verified startups</span><strong>50+</strong><em>Profiles on Calip.io</em></div>
                    <div><span>AI startup analysis</span><strong className="cl-metric-word">Live</strong><em>Summaries and indicators</em></div>
                    <div><span>Token marketplace</span><strong className="cl-metric-word">Soon</strong><em>Startup Performance Tokens</em></div>
                  </div>
                  <div className="cl-preview-chart"><div className="cl-chart-label"><span>What you can explore</span><strong>Traction <i>Milestones</i></strong></div><svg viewBox="0 0 680 120" role="img" aria-label="Illustrative startup growth indicators"><defs><linearGradient id="cl-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#77ddc3" stopOpacity=".28" /><stop offset="1" stopColor="#77ddc3" stopOpacity="0" /></linearGradient></defs><path d="M0 99 C38 91 49 101 85 82 S135 87 170 65 215 74 260 57 318 70 354 47 404 59 440 35 499 53 526 31 575 38 610 19 648 29 680 6 V120 H0Z" fill="url(#cl-chart-fill)" /><path d="M0 99 C38 91 49 101 85 82 S135 87 170 65 215 74 260 57 318 70 354 47 404 59 440 35 499 53 526 31 575 38 610 19 648 29 680 6" fill="none" stroke="#83e3ca" strokeWidth="2.4" /></svg><div className="cl-chart-ticks"><span>TRACTION</span><span>GROWTH</span><span>MILESTONES</span><span>ACTIVITY</span><span>TRACTION</span><span>GROWTH</span><span>UPDATES</span></div></div>
                </div>
              </div>
              <div className="cl-float-note"><span className="cl-float-icon"><Sparkles size={16} /></span><span><small>Signal detected</small><strong>New funding activity</strong></span><span className="cl-float-arrow"><ArrowUpRight size={15} /></span></div>
            </div>
            <div className="cl-hero-footnote"><span>BUILT FOR STARTUPS AND INDIVIDUALS</span><span>Reference figures from Calip.io  /  secure workspace access after wallet connection</span></div>
          </div>
          <a className="cl-scroll-cue" href="#opportunities" aria-label="Scroll to opportunities"><span /> Scroll to explore</a>
        </section>

        <section className="cl-capability-strip" aria-label="Calip capabilities">
          <div className="cl-shell cl-capability-inner">
            <a href="#opportunities"><span>01</span><strong>Discover</strong><small>Find companies worth a closer look</small><ArrowUpRight size={16} /></a>
            <a href="#app"><span>02</span><strong>Explore</strong><small>See the Calip experience</small><ArrowUpRight size={16} /></a>
          </div>
        </section>

        <section className="cl-section cl-opportunities" id="opportunities">
          <div className="cl-shell">
            <div className="cl-section-heading cl-heading-row">
              <div><p className="cl-kicker">Verified startup discovery</p><h2>Find the companies<br /><span>moving things forward.</span></h2><p>Browse startup profiles, compare company insights, and save the opportunities you want to revisit.</p></div>
              <a className="cl-text-link" href="#features">Explore Calip <ArrowRight size={16} /></a>
            </div>
            <div className="cl-explorer-toolbar">
              <label className="cl-search"><Search size={18} /><input ref={searchInputRef} type="search" placeholder="Search companies or sectors" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search companies" /><kbd>Ctrl K</kbd></label>
              <div className="cl-sector-filters" role="group" aria-label="Filter by sector">
                {sectors.map((item) => {
                  const isActive = sector === item;
                  return (
                    <button
                      key={item}
                      className={`cl-sector-btn ${isActive ? "active" : ""}`}
                      type="button"
                      onClick={() => setSector(item)}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeSectorPill"
                          className="cl-sector-pill-bg"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="cl-sector-btn-text">{item}</span>
                    </button>
                  );
                })}
              </div>
              <div className="cl-result-count">
                <span>{companies.length}</span> {sector === "All sectors" ? "opportunities" : sector} <span className="cl-result-divider"> / </span><Bookmark size={14} /> {companies.filter(c => watchlist.includes(c._id)).length} saved
                {companies.length > 4 && <span className="cl-scroll-hint">↕ scroll</span>}
              </div>
            </div>
            {companies.length ? (
              <div className="cl-grid-scroll-viewport" ref={gridViewportRef} data-lenis-prevent>
                <div className="cl-company-grid">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {companies.map((company, index) => (
                      <motion.div
                        key={company._id}
                        layout
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          opacity: { duration: 0.18, ease: "easeOut", delay: Math.min(index * 0.025, 0.1) },
                          scale: { duration: 0.18, ease: "easeOut", delay: Math.min(index * 0.025, 0.1) },
                          layout: { type: "spring", stiffness: 380, damping: 36, mass: 0.8 },
                        }}
                      >
                        <CompanyCard
                          company={company}
                          saved={watchlist.includes(company._id)}
                          onSave={toggleSaved}
                          onOpen={setSelectedCompany}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {companies.length > 4 && !gridAtBottom && <div className="cl-grid-fade-bottom" aria-hidden="true" />}
              </div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="cl-empty-state"
              >
                <Search size={22} />
                <strong>No companies match that search.</strong>
                <button type="button" onClick={() => { setQuery(""); setSector("All sectors"); }}>
                  Clear filters
                </button>
              </motion.div>
            )}
            <p className="cl-data-note"><ShieldCheck size={14} /> Company information and valuations are illustrative and provided for product exploration.</p>
          </div>
        </section>

        <section className="cl-section cl-product-story" id="how-it-works">
          <VideoBackground src="glow.mp4" poster="preview-product-uhd.jpg" className="cl-section-video" />
          <div className="cl-section-wash" />
          <div className="cl-shell cl-story-grid">
            <div className="cl-story-copy">
              <p className="cl-kicker">One thoughtful workflow</p>
              <h2>From a first signal<br />to a clearer decision.</h2>
              <p>Explore startup profiles, AI-assisted analysis, and a Web3 ecosystem designed to connect founders with a wider community of individuals.</p>
              <div className="cl-step-list">
                <div><span>01</span><p><strong>Discover startups</strong><small>Review company profiles, traction, and valuation references.</small></p><Check size={16} /></div>
                <div><span>02</span><p><strong>Read the signals</strong><small>Explore AI-assisted summaries and growth indicators.</small></p><Check size={16} /></div>
                <div><span>03</span><p><strong>Follow the ecosystem</strong><small>See company progress with transparent, on-chain activity in view.</small></p><Check size={16} /></div>
              </div>
              <a className="cl-button cl-button-primary" href="#features">Explore the platform <ArrowRight size={17} /></a>
            </div>
            <div className="cl-terminal-card">
              <div className="cl-terminal-head"><span><BarChart3 size={17} /> Company intelligence</span><span className="cl-terminal-badge"><i /> SCREENED</span></div>
              <div className="cl-terminal-company"><div className="cl-company-mark cl-mark-nova">NP</div><div><strong>NovaPay</strong><small>FinTech  /  Seed stage</small></div><span className="cl-ai-score">A<span>A-</span></span></div>
              <div className="cl-terminal-chart"><div className="cl-chart-label"><span>Growth signals</span><strong>Strong <i>+18.4%</i></strong></div><svg viewBox="0 0 500 132" role="img" aria-label="Illustrative growth signal chart"><defs><linearGradient id="cl-terminal-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#766cff" stopOpacity=".32" /><stop offset="1" stopColor="#766cff" stopOpacity="0" /></linearGradient></defs><path d="M0 116 C36 110 47 87 83 95 S133 72 160 79 201 59 228 67 270 40 301 48 348 36 371 40 407 18 433 26 466 9 500 12 V132 H0Z" fill="url(#cl-terminal-fill)" /><path d="M0 116 C36 110 47 87 83 95 S133 72 160 79 201 59 228 67 270 40 301 48 348 36 371 40 407 18 433 26 466 9 500 12" fill="none" stroke="#958cff" strokeWidth="2.5" /></svg><div className="cl-chart-ticks"><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span></div></div>
              <div className="cl-terminal-signals"><span><i className="signal-green" /> Investor interest <strong>Building</strong></span><span><i className="signal-purple" /> Traction signals <strong>Positive</strong></span><span><i className="signal-blue" /> Profile completeness <strong>94%</strong></span></div>
              <div className="cl-terminal-foot"><Sparkles size={15} /> AI summary <span>Research preview</span></div>
            </div>
          </div>
        </section>

        <section className="cl-feature-band" id="features">
          <div className="cl-shell">
            <div className="cl-section-heading cl-feature-heading"><p className="cl-kicker">More signal. Less noise.</p><h2>A workspace that keeps<br />you close to what matters.</h2><p>Follow activity, compare opportunities, and keep your research moving.</p></div>
            <div className="cl-feature-grid">
              {features.map((feature, index) => (
                <article className={`cl-feature-card cl-feature-${index + 1}`} key={feature.title}>
                  <VideoBackground src={feature.video} poster={feature.poster} className="cl-feature-video" />
                  <div className="cl-feature-shade" />
                  <div className="cl-feature-content"><span className="cl-feature-number">0{index + 1} / 03</span><p className="cl-kicker">{feature.eyebrow}</p><h3>{feature.title}</h3><p>{feature.copy}</p><Link href={feature.href}>{feature.action}<ArrowRight size={15} /></Link></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cl-section cl-mobile-feature" id="app">
          <VideoBackground src="glow.mp4" poster="preview-product-uhd.jpg" className="cl-section-video cl-mobile-bg" />
          <div className="cl-section-wash" />
          <div className="cl-shell cl-mobile-feature-grid">
            <div className="cl-mobile-copy"><p className="cl-kicker">One platform. Two growth journeys.</p><h2>Startup progress<br />in clear view.</h2><p>Explore Calip’s vision for a startup ecosystem where individuals can discover companies and founders can build visibility, community, and momentum.</p><ul><li><Check size={17} />Discover startup profiles and insights</li><li><Check size={17} />Explore AI summaries and growth indicators</li><li><Check size={17} />Follow progress and milestones</li><li><Check size={17} />A token marketplace is coming soon</li></ul><a className="cl-button cl-button-secondary" href="#features">Explore Calip <ArrowUpRight size={16} /></a></div>
            <div className="cl-app-window"><div className="cl-app-window-bar"><span className="cl-window-lights"><i /><i /><i /></span><span>Calip workspace</span><span><CircleHelp size={15} /></span></div><video loop muted playsInline preload="none" aria-hidden="true" data-background-video data-video-src={`${assets}/create-token-application.mp4`} data-poster-src={`${assets}/preview-product-uhd.jpg`} /><div className="cl-app-window-caption"><span><i /> Workspace preview</span><span>Explore at your pace</span></div></div>
          </div>
        </section>

        <section className="cl-section cl-founder-banner">
          <div className="cl-shell cl-founder-panel">
            <div className="cl-founder-orb" />
            <div className="cl-founder-copy"><p className="cl-kicker">For startups</p><h2>Build visibility.<br /><span>Grow your community.</span></h2><p>Set up a startup profile, share your progress, and build momentum with a wider global community.</p></div>
            <div className="cl-founder-stats"><span>STARTUP ECOSYSTEM</span><strong>Make your next<br />milestone visible.</strong><div><span><i /> Startup profile</span><span><i /> Analytics dashboard</span><span><i /> Community growth</span></div></div>
          </div>
        </section>

        <section className="cl-section cl-faq-section" id="faq">
          <div className="cl-shell cl-faq-grid">
            <div>
              <p className="cl-kicker">Good questions first</p>
              <h2>Clarity before<br />you get started.</h2>
              <p>Here&apos;s how to explore the experience and what to expect before connecting your wallet.</p>
            </div>
            <div className="cl-faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div className={`cl-faq-item ${isOpen ? "open" : ""}`} key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span>{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <p>{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="cl-newsletter-section">
          <div className="cl-shell cl-newsletter-card"><div><p className="cl-kicker">The Calip note</p><h2>A little more signal<br />in your inbox.</h2><p>Occasional product notes and market research. No noise.</p></div><form onSubmit={submitEmail} className="cl-newsletter-form"><label htmlFor="cl-newsletter-email">Email address</label><div><input id="cl-newsletter-email" type="email" placeholder="you@company.com" value={email} onChange={(event) => { setEmail(event.target.value); setSubscribed(false); }} required /><button type="submit" aria-label="Subscribe to Calip updates"><ArrowRight size={18} /></button></div><small>{subscribed ? <><Check size={14} /> You&apos;re on the list. Thanks for joining.</> : "A local sign-up preview. Your address is not sent or stored."}</small></form></div>
        </section>

        <section className="cl-deal-room" id="deal-room">
          <VideoBackground src="dealroom.mp4" poster="preview-dealroom-uhd.jpg" className="cl-deal-video" />
          <div className="cl-deal-shade" />
          <div className="cl-shell cl-deal-content"><p className="cl-kicker">A new startup ecosystem is taking shape</p><h2>Make room for<br /><span>what&apos;s next.</span></h2><p>Discover promising startups, follow company milestones, and explore the Calip product preview while the token marketplace is in development.</p><div className="cl-hero-actions"><button className="cl-button cl-button-primary" type="button" onClick={() => { setAllocationSaved(false); setAllocationOpen(true); }}>Preview an allocation <ArrowRight size={17} /></button><a className="cl-button cl-button-secondary" href="#opportunities">Explore startup profiles <ArrowUpRight size={16} /></a></div><div className="cl-deal-note"><ShieldCheck size={15} /> Illustrative preview  /  no funds move</div></div>
        </section>
      </main>

      <footer className="cl-footer">
        <div className="cl-shell"><div className="cl-footer-main"><div className="cl-footer-brand"><Link href="/" className="cl-brand" aria-label="Calip home"><Image src={`${assets}/caliplogo.png`} alt="Calip" width={98} height={34} className="cl-brand-logo" /></Link><p>Research with clarity. Invest with conviction. Keep every opportunity in view.</p><div className="cl-socials"><a href="https://x.com/InfoCalip" target="_blank" rel="noreferrer">X</a><a href="https://www.linkedin.com/company/calip1/" target="_blank" rel="noreferrer">in</a></div></div><div><h3>Platform</h3><a href="#opportunities">Discover</a><a href="#features">Explore</a></div><div><h3>Company</h3><a href="#faq">FAQs</a><a href="#how-it-works">How it works</a></div><div><h3>Stay connected</h3><p>Keep up with product notes and market research.</p><a className="cl-footer-email" href="mailto:hello@calip.io">hello@calip.io <ArrowUpRight size={14} /></a></div></div><div className="cl-footer-bottom"><span>&copy; {new Date().getFullYear()} Calip.io</span><span>Market information is illustrative and does not constitute investment advice.</span><a href="#main">Back to top </a></div></div>
      </footer>

      {(selectedCompany || walletOpen || allocationOpen) && <div className="cl-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setSelectedCompany(null); setWalletOpen(false); setAllocationOpen(false); } }}>
        {selectedCompany && <section className="cl-modal" role="dialog" aria-modal="true" aria-labelledby="cl-company-dialog-title"><button className="cl-modal-close" type="button" onClick={() => setSelectedCompany(null)} aria-label="Close company details"><X size={19} /></button><span className="cl-company-mark cl-modal-mark">{initials(selectedCompany.startupName)}</span><p className="cl-kicker">{selectedCompany.industrySector}  /  {selectedCompany.startupStage}</p><h2 id="cl-company-dialog-title">{selectedCompany.startupName}</h2><p className="cl-modal-copy">{selectedCompany.description}</p><div className="cl-modal-facts"><div><span>Illustrative valuation</span><strong>{compactMoney(selectedCompany.currentStartupValuation)}</strong></div><div><span>Funding status</span><strong>{selectedCompany.fundingStatus || "Open"}</strong></div><div><span>Profile views</span><strong>{Number(selectedCompany.views || 0).toLocaleString()}</strong></div></div><div className="cl-modal-actions"><button className="cl-button cl-button-primary" type="button" onClick={() => { setSelectedCompany(null); setAllocationSaved(false); setAllocationOpen(true); }}>Preview allocation <ArrowRight size={16} /></button><button className="cl-button cl-button-secondary" type="button" onClick={() => toggleSaved(selectedCompany._id)}><Bookmark size={15} /> {watchlist.includes(selectedCompany._id) ? "Saved" : "Save company"}</button></div><small className="cl-modal-disclaimer">Illustrative information only. No investment is submitted.</small></section>}
        {walletOpen && <section className="cl-modal cl-wallet-modal" role="dialog" aria-modal="true" aria-labelledby="cl-wallet-title"><button className="cl-modal-close" type="button" onClick={() => setWalletOpen(false)} aria-label="Close wallet settings"><X size={19} /></button><span className="cl-modal-icon"><Wallet size={21} /></span><p className="cl-kicker">{isMockEnabled() ? "Development preview" : "Secure wallet"}</p><h2 id="cl-wallet-title">{sampleWallet ? "Wallet connected" : "Connect your wallet"}</h2><p className="cl-modal-copy">{sampleWallet ? "Your wallet is connected to Calip." : "Connect your Ethereum wallet and sign a one-time message to enter the workspace. Calip never asks for your seed phrase or private key."}</p>{sampleWallet ? <div className="cl-wallet-address"><span>Wallet address</span><strong>{sampleWallet}</strong></div> : <div className="cl-wallet-benefits"><span><Check size={15} /> See a connected account state</span><span><Check size={15} /> Try saved company lists</span><span><Check size={15} /> {isMockEnabled() ? "No real wallet needed" : "Wallet access stays in your control"}</span></div>}{error && <p className="cl-modal-copy" role="alert" style={{ color: "#fda4af" }}>{error.message}</p>}<div className="cl-modal-actions">{sampleWallet ? <><button className="cl-button cl-button-primary" type="button" onClick={connectSampleWallet}>Open workspace <ArrowRight size={16} /></button><button className="cl-button cl-button-secondary" type="button" onClick={disconnectSampleWallet}>Disconnect wallet</button></> : <button className="cl-button cl-button-primary" type="button" onClick={connectSampleWallet} disabled={isConnecting}>{isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}{isConnecting ? connectionLabel : "Connect wallet"}</button>}<button className="cl-modal-text-button" type="button" onClick={() => setWalletOpen(false)}>Maybe later</button></div></section>}
        {allocationOpen && <section className="cl-modal" role="dialog" aria-modal="true" aria-labelledby="cl-allocation-title"><button className="cl-modal-close" type="button" onClick={() => setAllocationOpen(false)} aria-label="Close allocation preview"><X size={19} /></button><span className="cl-modal-icon"><BarChart3 size={21} /></span><p className="cl-kicker">Illustrative allocation</p><h2 id="cl-allocation-title">{allocationSaved ? "Preview saved" : "Explore an allocation."}</h2>{allocationSaved ? <><p className="cl-modal-copy">Your sample allocation of ${allocation.toLocaleString()} has been saved in this session. No order was placed and no funds moved.</p><div className="cl-allocation-success"><Check size={19} /> Saved for review</div></> : <><p className="cl-modal-copy">Adjust the sample amount to see how an allocation preview responds.</p><div className="cl-allocation-value"><span>Sample amount</span><strong>${allocation.toLocaleString()}</strong></div><input className="cl-range" type="range" min="500" max="25000" step="500" value={allocation} onChange={(event) => setAllocation(Number(event.target.value))} aria-label="Sample allocation amount" /><div className="cl-range-labels"><span>$500</span><span>$25,000</span></div><div className="cl-allocation-summary"><span>Selected amount<strong>${allocation.toLocaleString()}</strong></span><span>Estimated units<strong>{Math.round(allocation / 1.25).toLocaleString()}</strong></span></div><button className="cl-button cl-button-primary cl-full-button" type="button" onClick={() => setAllocationSaved(true)}>Save allocation preview <ArrowRight size={16} /></button></>}<small className="cl-modal-disclaimer">Illustrative only. No investment is submitted and no funds move.</small></section>}
      </div>}
      {toast && <div className="cl-toast" role="status"><Check size={16} /> {toast}</div>}
    </div>
  );
}
