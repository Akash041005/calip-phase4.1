// Mock user-domain data (V1, frontend-only).
// Shapes mirror GET /users/* responses consumed by UserInsights and Settings.

export const MOCK_USER = {
  _id: "mock-user-1",
  username: "demo_founder",
  email: "demo@calip.io",
  firstName: "Demo",
  lastName: "Founder",
  walletAddress: "0xMock7a11ceC4l1pD3m0F0und3r0001",
  role: "user",
  createdAt: "2026-01-15T10:00:00.000Z",
  settings: { darkMode: false },
};

const MOCK_NOTIFICATIONS = [
  { _id: "mock-notif-1", title: "NovaPay crossed 1,800 views", isRead: false, createdAt: "2026-09-09T10:00:00.000Z" },
  { _id: "mock-notif-2", title: "VoltGrid listing updated", isRead: false, createdAt: "2026-09-08T10:00:00.000Z" },
  { _id: "mock-notif-3", title: "Welcome to Calip (demo)", isRead: true, createdAt: "2026-09-01T10:00:00.000Z" },
];

export function mockFetchProfile() {
  return { user: { ...MOCK_USER } };
}

export function mockGetPreferences() {
  return {
    notifications: { priceAlerts: true, startupMilestones: true, newListings: false, weeklyDigest: true },
    privacy: {
      publicProfile: true,
      showPortfolioValue: false,
      showInvestmentActivity: true,
      appearInSearch: true,
      analyticsDataSharing: false,
    },
  };
}

export function mockGetSessions() {
  return {
    sessions: [
      { _id: "mock-session-1", device: "Chrome · Windows", location: "Bengaluru, IN", isCurrent: true },
    ],
  };
}

export function mockGetWallets() {
  return {
    wallets: [
      {
        walletAddress: "0xMock7a11ceC4l1pD3m0F0und3r0001",
        provider: "MetaMask (demo)",
        isPrimary: true,
      },
    ],
  };
}

export function mockGetNotifications() {
  return { items: MOCK_NOTIFICATIONS, total: MOCK_NOTIFICATIONS.length };
}

export function mockGetUnreadCount() {
  return { unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length };
}

export function mockGetKyc() {
  return { status: "not_verified" };
}
