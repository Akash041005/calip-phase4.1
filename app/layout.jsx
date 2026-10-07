import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/auth/AuthProvider";
import ThemeProvider from "../components/auth/ThemeProvider";
import SmoothScrollProvider from "../components/motion/SmoothScrollProvider";
import PageTransition from "../components/motion/PageTransition";
import Footer from "../components/dashboard/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import ChimiConsentGate from "../components/auth/ChimiConsentGate";

export const metadata = {
  title: "Calip — Dashboard",
  description: "Your investment portfolio at a glance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <AuthProvider>
          <ThemeProvider>
            <ChimiConsentGate>
              <SmoothScrollProvider>
                <PageTransition>
                  {children}
                  <Footer />
                </PageTransition>
              </SmoothScrollProvider>
            </ChimiConsentGate>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

