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

export const metadata = {
  title: "Calip | See the signal. Move with conviction.",
  description: "Discover promising companies and explore Calip's research workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <AuthProvider>
          <ThemeProvider>
            <RouteAccessGate>
              <ChimiConsentGate>
                <SmoothScrollProvider>
                  <PageTransition>{children}</PageTransition>
                </SmoothScrollProvider>
              </ChimiConsentGate>
            </RouteAccessGate>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

