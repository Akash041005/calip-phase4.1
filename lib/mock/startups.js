// Mock startup catalog (V1, frontend-only).
// Shapes mirror the real backend responses consumed by:
// searchStartups -> { startups }, getStartupById -> startup object,
// getMyStartups -> { startups }. TokenDetailOverview overlays
// name/symbol/tag/about/mcap/owner from startupData when present.

export const MOCK_STARTUPS = [
  {
    _id: "mock-nova-pay",
    startupName: "NovaPay",
    symbol: "NOVAP",
    industrySector: "FinTech",
    category: "FinTech",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 45000000,
    valuation: 45000000,
    funding: { valuation: 45000000 },
    views: 1840,
    description:
      "NovaPay is building instant UPI-native credit rails for small merchants, with underwriting based on live cash-flow signals.",
    about:
      "NovaPay is building instant UPI-native credit rails for small merchants, with underwriting based on live cash-flow signals.",
    owner: "0xNova...Pay01",
    tag: "FinTech",
    mcap: "$4.5M",
    status: "approved",
    createdAt: "2026-06-14T10:00:00.000Z",
  },
  {
    _id: "mock-agriverse",
    startupName: "AgriVerse",
    symbol: "AGRIV",
    industrySector: "AgriTech",
    category: "AgriTech",
    startupStage: "Pre-Seed",
    fundingStatus: "Open",
    currentStartupValuation: 12000000,
    valuation: 12000000,
    funding: { valuation: 12000000 },
    views: 640,
    description:
      "AgriVerse connects farmer collectives directly with buyers and provides vernacular price discovery over chat.",
    about:
      "AgriVerse connects farmer collectives directly with buyers and provides vernacular price discovery over chat.",
    owner: "0xAgri...Ve02",
    tag: "AgriTech",
    mcap: "$1.2M",
    status: "under_review",
    createdAt: "2026-07-02T10:00:00.000Z",
  },
  {
    _id: "mock-medisync",
    startupName: "MediSync",
    symbol: "MEDIS",
    industrySector: "HealthTech",
    category: "HealthTech",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 30000000,
    valuation: 30000000,
    funding: { valuation: 30000000 },
    views: 1290,
    description:
      "MediSync digitises neighbourhood clinics with interoperable records, queue management and follow-up care plans.",
    about:
      "MediSync digitises neighbourhood clinics with interoperable records, queue management and follow-up care plans.",
    owner: "0xMedi...Sy03",
    tag: "HealthTech",
    mcap: "$3.0M",
    status: "approved",
    createdAt: "2026-05-21T10:00:00.000Z",
  },
  {
    _id: "mock-eduspark",
    startupName: "EduSpark",
    symbol: "EDUS",
    industrySector: "EdTech",
    category: "EdTech",
    startupStage: "Pre-Seed",
    fundingStatus: "Open",
    currentStartupValuation: 8000000,
    valuation: 8000000,
    funding: { valuation: 8000000 },
    views: 410,
    description:
      "EduSpark offers bite-size, vernacular upskilling paths for first-time earners with mentor-led cohorts.",
    about:
      "EduSpark offers bite-size, vernacular upskilling paths for first-time earners with mentor-led cohorts.",
    owner: "0xEduS...04",
    tag: "EdTech",
    mcap: "$0.8M",
    status: "pending",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    _id: "mock-voltgrid",
    startupName: "VoltGrid",
    symbol: "VOLTG",
    industrySector: "CleanTech",
    category: "CleanTech",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 52000000,
    valuation: 52000000,
    funding: { valuation: 52000000 },
    views: 2210,
    description:
      "VoltGrid builds battery-swapping micro-grids for delivery fleets, with predictive demand balancing.",
    about:
      "VoltGrid builds battery-swapping micro-grids for delivery fleets, with predictive demand balancing.",
    owner: "0xVolt...Gr05",
    tag: "CleanTech",
    mcap: "$5.2M",
    status: "approved",
    createdAt: "2026-04-11T10:00:00.000Z",
  },
  {
    _id: "mock-craftkart",
    startupName: "CraftKart",
    symbol: "CRAFT",
    industrySector: "E-Commerce",
    category: "E-Commerce",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 18000000,
    valuation: 18000000,
    funding: { valuation: 18000000 },
    views: 970,
    description:
      "CraftKart gives artisan clusters a shared storefront with logistics, QC and export tooling built in.",
    about:
      "CraftKart gives artisan clusters a shared storefront with logistics, QC and export tooling built in.",
    owner: "0xCraft...Ka06",
    tag: "E-Commerce",
    mcap: "$1.8M",
    status: "approved",
    createdAt: "2026-06-30T10:00:00.000Z",
  },
  {
    _id: "mock-legalsetu",
    startupName: "LegalSetu",
    symbol: "LEGLS",
    industrySector: "LegalTech",
    category: "LegalTech",
    startupStage: "Pre-Seed",
    fundingStatus: "Open",
    currentStartupValuation: 9500000,
    valuation: 9500000,
    funding: { valuation: 95000000 },
    views: 380,
    description:
      "LegalSetu simplifies contracts and compliance for early startups with guided, vernacular-first workflows.",
    about:
      "LegalSetu simplifies contracts and compliance for early startups with guided, vernacular-first workflows.",
    owner: "0xLegal...Se07",
    tag: "LegalTech",
    mcap: "$0.95M",
    status: "pending",
    createdAt: "2026-08-09T10:00:00.000Z",
  },
  {
    _id: "mock-orbitlabs",
    startupName: "OrbitLabs",
    symbol: "ORBIT",
    industrySector: "SpaceTech",
    category: "SpaceTech",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 78000000,
    valuation: 78000000,
    funding: { valuation: 78000000 },
    views: 3050,
    description:
      "OrbitLabs builds low-cost ground-station kits and scheduling software for small-satellite operators.",
    about:
      "OrbitLabs builds low-cost ground-station kits and scheduling software for small-satellite operators.",
    owner: "0xOrbit...La08",
    tag: "SpaceTech",
    mcap: "$7.8M",
    status: "approved",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    _id: "mock-swaadbox",
    startupName: "SwaadBox",
    symbol: "SWAAD",
    industrySector: "FoodTech",
    category: "FoodTech",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 22000000,
    valuation: 22000000,
    funding: { valuation: 22000000 },
    views: 1120,
    description:
      "SwaadBox runs cloud kitchens for regional cuisines with demand forecasting and shared commissaries.",
    about:
      "SwaadBox runs cloud kitchens for regional cuisines with demand forecasting and shared commissaries.",
    owner: "0xSwaad...Bo09",
    tag: "FoodTech",
    mcap: "$2.2M",
    status: "under_review",
    createdAt: "2026-07-19T10:00:00.000Z",
  },
  {
    _id: "mock-fleetai",
    startupName: "FleetAI",
    symbol: "FLEET",
    industrySector: "AI & ML",
    category: "AI & ML",
    startupStage: "Seed",
    fundingStatus: "Open",
    currentStartupValuation: 61000000,
    valuation: 61000000,
    funding: { valuation: 61000000 },
    views: 2680,
    description:
      "FleetAI optimises mid-mile logistics with routing models trained on Indian road and mandi patterns.",
    about:
      "FleetAI optimises mid-mile logistics with routing models trained on Indian road and mandi patterns.",
    owner: "0xFleet...AI10",
    tag: "AI & ML",
    mcap: "$6.1M",
    status: "approved",
    createdAt: "2026-02-27T10:00:00.000Z",
  },
];

export function mockSearchStartups(keyword = "", page = 1, limit = 50) {
  const q = String(keyword || "").trim().toLowerCase();
  const filtered = q
    ? MOCK_STARTUPS.filter((s) =>
        [s.startupName, s.industrySector, s.startupStage, s.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    : [...MOCK_STARTUPS];
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
  const start = (safePage - 1) * safeLimit;
  return {
    startups: filtered.slice(start, start + safeLimit),
    total: filtered.length,
    page: safePage,
    limit: safeLimit,
  };
}

export function mockGetStartupById(id) {
  return MOCK_STARTUPS.find((s) => s._id === id || s.startupName === id) || null;
}

export function mockGetMyStartups() {
  // First four mock startups belong to the demo founder.
  return { startups: MOCK_STARTUPS.slice(0, 4) };
}
