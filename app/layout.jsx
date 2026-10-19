import { Inter } from "next/font/google";
import "./globals.css";
import "../components/landing/landing.css";
import AuthProvider from "../components/auth/AuthProvider";
import ThemeProvider from "../components/auth/ThemeProvider";
import SmoothScrollProvider from "../components/motion/SmoothScrollProvider";
import PageTransition from "../components/motion/PageTransition";
import RouteAccessGate from "../components/auth/RouteAccessGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import ChimiConsentGate from "../components/auth/ChimiConsentGate";
import ConnectWalletModal from "../components/auth/ConnectWalletModal";

export const metadata = {
  title: "Calip | See the signal. Move with conviction.",
  description: "Discover promising companies and explore Calip's research workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-[#f8fafc] text-slate-900 dark:bg-[#090a0f] dark:text-[#f8fafc] transition-colors duration-150">
        <AuthProvider>
          <ThemeProvider>
            <RouteAccessGate>
              <ChimiConsentGate>
                <SmoothScrollProvider>
                  <PageTransition>{children}</PageTransition>
                </SmoothScrollProvider>
              </ChimiConsentGate>
            </RouteAccessGate>
            <ConnectWalletModal />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

