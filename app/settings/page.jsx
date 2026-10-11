import { Sora } from "next/font/google";
import Navbar from "../../components/dashboard/Navbar";
import Footer from "../../components/dashboard/Footer";
import ProfileSection from "../../components/settings/ProfileSection";
import AppearanceSection from "../../components/settings/AppearanceSection";
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors">
      <Navbar activePage="settings" />

      <main className="mx-auto max-w-[1100px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="pt-8 pb-4 border-b border-slate-200 dark:border-white/[0.06] transition-colors">
          <p className="cl-kicker-label">
            <span className="cl-mint-dot" />
            Account Preferences
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight text-slate-900 dark:text-white sm:text-[40px] transition-colors">
            Settings
          </h1>
          <p className="mt-2 text-[14.5px] text-slate-500 dark:text-[#a6adbf] transition-colors">
            Manage your account preferences, profile details, and security settings.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <ProfileSection />
          <AppearanceSection />
          <ConnectedWallets />
          <NotificationsSection />
          <PrivacySection />
          <SecuritySection />
          <ActiveSessions />
          <DeleteAccount />
        </div>
      </main>

      <Footer />
    </div>
  );
}
