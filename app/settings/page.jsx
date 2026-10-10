import { Sora } from "next/font/google";
import Navbar from "../../components/dashboard/Navbar";
import ProfileSection from "../../components/settings/ProfileSection";
import ConnectedWallets from "../../components/settings/ConnectedWallets";
import NotificationsSection from "../../components/settings/NotificationsSection";
import PrivacySection from "../../components/settings/PrivacySection";
import SecuritySection from "../../components/settings/SecuritySection";
import ActiveSessions from "../../components/settings/ActiveSessions";
import DeleteAccount from "../../components/settings/DeleteAccount";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Calip — Settings",
  description:
    "Manage your account preferences, connected wallets, notifications, privacy, security, and active sessions on Calip.",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f4f5fb]">
      <Navbar activePage="settings" />

      <main className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4 border-b border-white/[0.06]">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Account Preferences
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight text-white sm:text-[40px]">
            Settings
          </h1>
          <p className="mt-2 text-[14.5px] text-[#a6adbf]">
            Manage your account preferences, profile details, and security settings.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <ProfileSection />
          <ConnectedWallets />
          <NotificationsSection />
          <PrivacySection />
          <SecuritySection />
          <ActiveSessions />
          <DeleteAccount />
        </div>
      </main>
    </div>
  );
}
