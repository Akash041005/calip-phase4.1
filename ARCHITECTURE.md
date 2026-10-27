# CALIP Frontend Architecture & Directory Guide

This document defines the architectural conventions, directory organization, and component placement standards for the `calip-phase4.1` Next.js (App Router) web application.

---

## 1. Directory Overview & Folder Organization

```
calip-phase4.1/
├── app/                           # Next.js App Router (File-system based routes)
│   ├── admin/                     # Super-Admin operations & audit portal
│   │   ├── dashboard/             # Live review queues, soft-cap metrics, audit events
│   │   ├── login/                 # Super-admin authentication
│   │   └── startups/              # Detailed startup verification & auction launcher
│   │       └── [id]/              # Single startup administrative review
│   ├── analytics/                 # Market-wide sector analysis & startup comparisons
│   ├── auction/                   # On-chain Dutch auctions & presales
│   │   ├── live/                  # Active Dutch auctions & bid placement
│   │   ├── upcoming/              # Pre-launch queue & token announcements
│   │   └── closed/                # Concluded auctions & settlement summaries
│   ├── companies/                 # Startup directory & individual profiles
│   ├── contact/                   # Support, partnership inquiries, and FAQ routing
│   ├── dashboard/                 # Trader terminal & unified portfolio overview
│   ├── faq/                       # Structured knowledge base & investor Q&A
│   ├── founders/                  # Founder application portal & onboarding
│   ├── insights/                  # Deep-dive analytics per token
│   │   └── [id]/                  # Real-time token detail with candlestick chart
│   ├── landing/                   # Public-facing homepage & venture discovery
│   ├── marketplace/               # Secondary ERC-20 trading marketplace
│   │   ├── [id]/                  # Individual listing trade terminal
│   │   └── create/                # Seller listing creation workflow
│   ├── my-startups/               # Founder venture management portal
│   ├── overview/                  # Quick redirects to user insights
│   ├── performance-summary/       # Portfolio ROI, sector allocation, and AI advice
│   ├── pro/                       # Tiered subscription plans (Free vs Pro)
│   ├── product-tour/              # Interactive onboarding walkthrough
│   ├── profile/                   # User account, participation history, watchlist
│   ├── settings/                  # User security, active sessions, and appearance
│   ├── trending/                  # Trending venture news & sector signals
│   ├── globals.css                # Global design system tokens & glassmorphic styling
│   └── layout.jsx                 # Root layout with Auth & Theme providers
├── components/                    # Reusable React components grouped by domain
│   ├── analytics/                 # Bubble charts, deal stage distribution, comparison tables
│   ├── auction/                   # AuctionCard, bid modals, soft-cap visualizer
│   ├── auth/                      # Web3 wallet connection, EIP-191 AuthProvider, access gates
│   ├── companies/                 # Startup tables, filters, and cards
│   ├── dashboard/                 # Top trader ticker, navbar, stat cards, portfolio banner
│   ├── faq/                       # Accordion components and category filters
│   ├── founders/                  # Multi-step application form & marketing content
│   ├── home/                      # Ecosystem pillars, institutional hero, unified home
│   ├── insights/                  # Valuation radar, revenue forecasts, token overview
│   ├── landing/                   # Landing hero, company grid, watchlist teasers
│   ├── layout/                    # Layout exports (Navbar, Footer, TopTraderTicker)
│   ├── market/                    # Core MarketTerminal engine & order book
│   ├── marketplace/               # Secondary market order book, buy modals, listing creator
│   ├── motion/                    # Framer Motion stagger groups, fade-ups, smooth scroll
│   ├── overview/                  # TokenDetailOverview (high-performance canvas chart)
│   ├── performance-summary/       # Portfolio chart, sector allocations, returns bar chart
│   ├── pro/                       # Pricing cards, plan comparison toggles, upgrade modal
│   ├── profile/                   # UserInsights tabbed dashboard (Watchlist, Trades, Ventures)
│   ├── settings/                  # Settings cards, appearance toggle, session manager
│   ├── trending-news/             # News feed, featured cards, category tabs, badge colors
│   └── ui/                        # Low-level primitives (ModalPortal)
├── lib/                           # Data layer, API clients, Web3 infrastructure
│   ├── adminApi.js                # Super-Admin endpoints (startups review, fundraises, audit)
│   ├── analyticsApi.js            # Aggregated metrics, sector funding, comparison
│   ├── apiClient.js               # Authoritative HTTP client with auto-refresh & bearer auth
│   ├── authApi.js                 # EIP-191 wallet nonces, signature verification, session
│   ├── config.js                  # Environment configuration & API base URLs
│   ├── contactApi.js              # Support inquiries submission
│   ├── faqs.js                    # Comprehensive investor and founder FAQ dataset
│   ├── format.js                  # Currency & number formatting utilities
│   ├── insightsApi.js             # Token metrics & financial forecasting
│   ├── marketplaceApi.js          # Secondary listings, buy/sell orders, trade history
│   ├── newsApi.js                 # News article feeds
│   ├── oracleApi.js               # Base L2 price oracle verification
│   ├── participationApi.js        # User auction bid history
│   ├── portfolioApi.js            # User portfolio balances & performance summaries
│   ├── presalesApi.js             # On-chain Dutch auctions & bid placement
│   ├── socketClient.js            # Real-time WebSocket connection for live trades
│   ├── startupsApi.js             # Public startup search & profiles
│   ├── startupsManageApi.js       # Founder startup creation, updates, and deletion
│   ├── startupsUploadApi.js       # Pitch deck and logo multipart file upload
│   ├── tokenStore.js              # Client-side access token & session storage
│   ├── tradingApi.js              # Token OHLC candles, order book, trader leaderboard
│   ├── usersApi.js                # User profile, watchlist, sessions, wallets, notifications
│   └── wallet.js                  # Browser wallet connector (MetaMask, Coinbase, injected)
└── public/                        # Static assets (logos, icons, fonts)
```

---

## 2. Component Placement Rules

| What are you building? | Where does it belong? | Example |
| :--- | :--- | :--- |
| **New page or route** | `app/<route>/page.jsx` | `app/auction/live/page.jsx` |
| **Dynamic route segment** | `app/<route>/[id]/page.jsx` | `app/companies/[id]/page.jsx` |
| **Domain-specific component** | `components/<domain>/<Name>.jsx` | `components/auction/AuctionCard.jsx` |
| **Global layout component** | `components/dashboard/` or `components/layout/` | `components/dashboard/Navbar.jsx` |
| **Backend API communication** | `lib/<domain>Api.js` | `lib/presalesApi.js` |
| **Modal dialog** | `components/<domain>/` using `ModalPortal` from `components/ui/` | `components/marketplace/BuyModal.jsx` |
| **Static content or config** | `components/<domain>/<name>.js` or `lib/<name>.js` | `components/founders/foundersContent.js` |

---

## 3. Data Flow Architecture

1. **User Interaction**: User clicks an action (e.g. Place Bid, List Token, Verify Startup).
2. **API Client (`lib/*Api.js`)**:
   - Calls `apiFetch(url, options)` from [lib/apiClient.js](file:///d:/Tech_Projects/11_CALIP/code/calip-phase4.1/lib/apiClient.js).
   - Automatically injects the active JWT `Authorization: Bearer <token>` from [lib/tokenStore.js](file:///d:/Tech_Projects/11_CALIP/code/calip-phase4.1/lib/tokenStore.js).
   - Automatically handles 401 token refresh through `refreshAccessToken()` without interrupting the user.
3. **Backend Service (`calip.io-backend`)**:
   - Validates payload against MongoDB Atlas.
   - Enforces business logic (e.g., 70% soft-cap, KYC verification, cryptographic nonces).
   - Interacts with Base Sepolia L2 contracts when on-chain actions occur.
4. **State Hydration**:
   - React components receive validated JSON payloads directly.
   - Ambient read-only mode allows visitors to inspect the platform; state-mutating actions prompt wallet connection via `useAuth()`.

---

## 4. Design & Theme System

- **Dual-Mode System**: Every component strictly supports both Light Mode (`bg-[#f8fafc]`, `text-slate-900`) and Dark Mode (`bg-[#090a0f]`, `text-[#f8fafc]`).
- **Interactive Cards**: Use `.cl-card-interactive` for hover states and subtle glassmorphic borders.
- **Accents**:
  - Primary Brand: Violet/Indigo (`#6366f1` / `#7c6cf0`)
  - Success / Gains: Emerald (`#10b981`)
  - Warning / Soft-Cap: Amber (`#f59e0b`)
  - Danger / Rejections: Rose (`#f43f5e`)

---

## 5. Frontend Audit & Cleanup History

During the Phase 4.1 modernization audit:
1. **Mock Data Elimination**: Removed all `isMockEnabled()` mock branches from 16 API files. Deleted the entire legacy `lib/mock/` directory (9 files).
2. **Dead Component Removal**: Removed 13 obsolete mock components (`BeforeInvesting`, `BeforePortfolioChart`, `BeforeSectorAllocation`, `beforeMockData`, `AfterInvesting`, `AfterInvestingActivated`, `AIRecommendationsActivated`, `AIRecommendations`, `Dashboard.jsx`, `RecentActivity`, `WatchlistBefore`, `WatchlistAfter`, `CompanyCard.jsx`).
3. **Misleading Name Refactor**: Renamed marketing content files (`foundersMockData.js` -> `foundersContent.js`, `proMockData.js` -> `pricingPlans.js`, `trendingNewsMockData.js` -> `badgeColors.js`).
4. **Duplicate Route Pruning**: Removed redundant `app/setting` directory in favor of canonical `app/settings`.
5. **Compilation Verification**: Verified 100% build pass with Next.js Turbopack across all 29 routes in <7s.
