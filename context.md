# Calip.io Frontend Architecture & System Context (`context.md`)

**Repository**: `calip-phase4.1`  
**Classification**: Frontend Architecture, Component Hierarchy, API Integration, and System Context Master  
**Active Working Branch**: `vismay`  
**Framework**: Next.js 16.2.12 (App Router) + React 19.2.4  
**Styling**: Tailwind CSS v4 + Custom Design System Tokens  
**Port / Local Base URL**: `http://localhost:3000`  

---

## 1. System Profile & Architectural Overview

`calip-phase4.1` is the official client interface for Calip.io—a startup discovery, utility-token launch, and secondary trading terminal. It interfaces with the Node.js/Express backend (`calip.io-backend`) running on `http://localhost:5001`.

### Core Technology Stack
- **Framework**: Next.js `16.2.12` with App Router architecture and Turbopack compiler.
- **Core UI**: React `19.2.4` and React DOM `19.2.4`.
- **Styling Engine**: Tailwind CSS `v4` with CSS variable design tokens and custom utility classes.
- **Micro-Animations & Physics**: Motion `13.1.0` (Framer Motion) providing fluid page transitions and modal springs.
- **Smooth Scrolling**: Lenis `1.3.26` wrapped in `SmoothScrollProvider` with auto-throttling when backgrounded.
- **Data Visualization**: Recharts `3.10.1` (Donut, Multi-Bar, Scatter, Line) plus an institutional custom HTML5 Canvas Candlestick Engine for OHLC series.
- **Icons**: Lucide React `1.27.0`.
- **Real-Time Client**: Socket.IO Client `4.8.3` bound to wallet-address rooms for instant push notifications.
- **Web3 Interface**: Direct EIP-1193 RPC injection via `window.ethereum` (MetaMask / Coinbase Wallet) for account discovery, chain validation, and EIP-191 personal message signing.

---

## 2. Directory Structure & File Map

```
calip-phase4.1/
├── app/                           # Next.js App Router Pages & Layouts
│   ├── layout.jsx                 # Root layout cascading providers (Auth, Theme, Gates, Modal, Lenis)
│   ├── globals.css                # Global CSS variables, design system tokens, typography
│   ├── page.jsx                   # Unified Platform Discovery & Live Terminal (SCR-001)
│   ├── product-tour/page.jsx      # Animated Product Tour & Video Showcase (SCR-001B)
│   ├── landing/page.jsx           # Redirects to /product-tour
│   ├── dashboard/page.jsx         # Executive Markets Terminal & Trader Command Hub (SCR-002)
│   ├── marketplace/               # Token catalog and application forms
│   │   ├── page.jsx               # Token Catalog (SCR-003)
│   │   ├── create/page.jsx        # Startup Token Application Form (SCR-004)
│   │   └── [id]/page.jsx          # Token Details & Secondary Trade Panel (SCR-005)
│   ├── auction/                   # Primary crowdfunding auction suite
│   │   ├── live/page.jsx          # Live Auctions & Bidding (SCR-006)
│   │   ├── upcoming/page.jsx      # Scheduled Launches (SCR-007)
│   │   └── closed/page.jsx        # Concluded Auctions Archive (SCR-008)
│   ├── analytics/                 # Platform Intelligence Suite
│   │   ├── page.jsx               # Ecosystem Analytics (SCR-009)
│   │   └── comparison/page.jsx    # Head-to-Head Startup Comparison (SCR-010)
│   ├── trending/page.jsx          # Market Signals & News Feed (SCR-011)
│   ├── founders/page.jsx          # Founders Hub & Bridge (SCR-012)
│   ├── faq/page.jsx               # Knowledge Base & FAQ Search (SCR-013)
│   ├── performance-summary/page.jsx # Portfolio Diversification & Allocations (SCR-014)
│   ├── my-startups/page.jsx       # Founder Submitted Startups Management (SCR-015)
│   ├── profile/page.jsx           # User Profile & Activity Ledger (SCR-016)
│   ├── settings/page.jsx          # Account Hub, Security, Appearance (SCR-017)
│   ├── insights/[id]/page.jsx     # Canonical Startup Detail & Canvas OHLC (SCR-018)
│   ├── contact/page.jsx           # General Support & Investor Inquiries (SCR-024)
│   └── admin/                     # Administrative Governance Suite
│       ├── page.jsx               # Admin Routing / Gate
│       ├── login/page.jsx         # Scrypt Email/Password Login
│       ├── dashboard/page.jsx     # Admin Operations Hub (Review, Auctions, Users)
│       └── startups/              # Startup Vetting Desk & Application Dossier
│           ├── page.jsx           # Tabbed Review Queue with Search & Filters
│           └── [id]/page.jsx      # Application Deep Dive, Pitch Deck PDF Viewer, Approve/Reject Actions
├── components/                    # Modular UI Components
│   ├── home/                      # UnifiedHome, InstitutionalHero, EcosystemPillars, HomeFaqAccordion
│   ├── layout/                    # Navbar, Footer, TopTraderTicker, NotificationBell barrel exports
│   ├── admin/                     # Admin review console & operational views
│   ├── analytics/                 # Donut, Bar, Scatter, and Table Recharts modules
│   ├── auction/                   # AuctionCard, AuctionFilterTabs, Bidding Modal
│   ├── auth/                      # AuthProvider, ConnectWalletModal, ConnectWalletButton, RouteAccessGate
│   ├── dashboard/                 # Navbar, TopTraderTicker, DashboardHeader, TraderPortfolioBanner, Footer
│   ├── founders/                  # Founders marketing sections & bridge
│   ├── market/                    # MarketTerminal, Sparklines, Order Book, Tables, Stream cards
│   ├── marketplace/               # TokenCard, TokenDetail, TokenTradePanel, WatchlistButton, Charts
│   ├── overview/                  # TokenDetailOverview, Canvas Candlestick Engine
│   ├── profile/                   # UserInsights tabs and summary cards
│   ├── settings/                  # Profile, Security, Appearance, ConnectedWallets, Sessions
│   └── trending-news/             # CategoryTabs, FeaturedCard, NewsListItem
├── lib/                           # API Transport, Services, and State Stores
│   ├── apiClient.js               # Central HTTP client with single-flight mutex refresh
│   ├── adminApi.js                # Enterprise Admin v1 API client (/admin/v1/*)
│   ├── analyticsApi.js            # Analytics metrics fetching
│   ├── authApi.js                 # Wallet challenge-response SIWE auth
│   ├── contactApi.js              # General & investor inquiry submission
│   ├── marketplaceApi.js          # Secondary market orders & buy/sell actions
│   ├── newsApi.js                 # Market intelligence news articles
│   ├── participationApi.js        # User auction investment history
│   ├── portfolioApi.js            # User equity valuation & sector breakdown
│   ├── presalesApi.js             # Auction rounds and bid commitments
│   ├── socketClient.js            # Socket.IO connection & event dispatchers
│   ├── startupsApi.js             # Public startup search and detail retrieval
│   ├── startupsManageApi.js       # Founder startup retrieval, update, and deletion
│   ├── startupsUploadApi.js       # Multipart startup submission with Bearer auth
│   ├── tokenStore.js              # Client memory store for tokens
│   ├── tradingApi.js              # Token directory, OHLC, holders, live trades
│   ├── usersApi.js                # Profile, preferences, wallets, sessions, watchlist
│   ├── wallet.js                  # EIP-1193 wrapper for window.ethereum
│   └── mock/                      # Rich fallback fixtures for preview and resilience
├── public/                        # Static brand assets, logos, and preview media
└── history.md                     # Engineering modification history log
```

---

## 3. Design System & Theming Tokens

The frontend adheres to an **institutional fintech dark/light dual design system**:
- **Canvas / Root Background**:
  - Dark: Deep Matte Obsidian `#090a0f`
  - Light: Clean Slate `#f8fafc`
- **Card Surfaces**:
  - Dark: Elevated Slate `#151824` with hairline border `rgba(255, 255, 255, 0.12)`
  - Light: Pure White `#ffffff` with hairline border `rgba(0, 0, 0, 0.08)`
- **Typography**: Inter / Outfit modern fonts with high contrast tabular numbers.
- **Accents**:
  - Calm Financial Emerald: `#10b981` (Gains, Live Status, Success)
  - Calm Rose: `#f43f5e` (Losses, Decreases)
  - Calip Violet: `#8174ff` (Primary Brand Mark)
- **Key Utility Classes**:
  - `.cl-glass-card`: Glassmorphism card surface with backdrop blur.
  - `.cl-btn-primary`: High-contrast pill CTA (pure white in dark mode, slate-900 in light mode).
  - `.cl-btn-secondary`: Translucent bordered pill with interactive hover lift.
  - `.cl-kicker-label`: Uppercase tracking kicker badge with live pulsing dot.

---

## 4. Authentication & Session Protocol

1. **Challenge Issuance**: The frontend calls `POST /auth/nonce` via `requestNonce(walletAddress)`.
2. **Signature**: Dispatches `personal_sign` via `window.ethereum` requesting the user to sign `Sign this nonce to login: {nonce}`.
3. **Verification**: Submits address and signature to `POST /auth/verify`. Receives `{ accessToken, refreshToken, sessionId, expiresAt, walletAddress, role }`.
4. **Storage**:
   - Access token is held in client memory (`apiClient.js:accessToken`).
   - Session metadata and refresh token are cached in `localStorage` under `calip.auth.v2`.
5. **Heartbeat**: Every 5 minutes while active, `AuthProvider` calls `POST /auth/activity` to touch `lastActive` timestamp.
6. **Token Refresh (Single-Flight Mutex)**: When an API request encounters HTTP 401, `apiClient.js` initiates `attemptRefresh()` sending `{ refreshToken }` to `POST /auth/refresh`, updates the in-memory access token, and retries original requests seamlessly.

---

## 5. Pure Real API Connectivity (Zero Mock Data)

Per SRS Section 5.2 & FR-024, `calip-phase4.1` operates in **Pure Real Mode** (`NEXT_PUBLIC_USE_MOCKS=false` in `.env.local`):
- All fallback arrays, hardcoded KPI numbers, simulated trades, and fake startup cards have been removed from `lib/tradingApi.js`, `lib/presalesApi.js`, `lib/marketplaceApi.js`, `lib/startupsApi.js`, `lib/newsApi.js`, and `LandingPage.jsx`.
- When database collections are empty, screens render truthful, clean empty states (e.g., "0 active tokens", "No presales currently active", etc.) rather than fabricating live data.
- The platform queries live endpoints directly on `http://localhost:5001`.

---

## 6. How to Run Locally

```bash
# In calip-phase4.1 directory:
npm install
npm run dev      # Starts Next.js development server on http://localhost:3000
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome.
