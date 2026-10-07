export const pricingPlans = [
  {
    id: "free",
    variant: "free",
    name: "Free",
    price: { monthly: "₹0", annual: "₹0" },
    description:
      "Everything you need to get started discovering and tracking startups.",
    features: [
      { id: 1, label: "Browse all companies", included: true },
      { id: 2, label: "Create personalised Watchlist", included: true },
      { id: 3, label: "Trending news feed", included: true },
      { id: 4, label: "Basic Auction Access", included: true },
      { id: 5, label: "Portfolio Dashboard", included: true },
      { id: 6, label: "Performance Summary", included: true },
      { id: 7, label: "Ai Insights", included: false },
      { id: 8, label: "Advanced Analysis", included: false },
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    variant: "pro",
    name: "Pro",
    price: { monthly: "₹199", annual: "₹999" },
    divider: "/",
    suffix: { monthly: "month", annual: "year" },
    description:
      "Unlock Ai insights, Advanced analysis and other upcoming premium features",
    features: [
      { id: 1, label: "Ai company insights", included: true },
      { id: 2, label: "Advanced analysis and charts", included: true },
      { id: 3, label: "Unlimited Watchlist", included: true },
      { id: 4, label: "Priority Auction Access", included: true },
      { id: 5, label: "Ai investment summaries", included: true },
      { id: 6, label: "Export reports (CSV/PDF)", included: true },
      { id: 7, label: "Premium investor community", included: true },
      { id: 8, label: "Dedicated all time support", included: true },
    ],
    cta: "Upgrade to Pro Plan",
  },
];
