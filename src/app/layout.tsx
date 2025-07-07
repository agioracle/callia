import type { Metadata } from "next";
import { Newsreader, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Morning Brief - Personalized Morning Briefings Powered by AI",
  description: "Get personalized daily morning briefings from your favorite news sources. AI-powered news aggregation delivered to your inbox and available in text and audio formats.",
  keywords: ["morning briefing", "morning brief", "morning brew", "personalized", "daily news", "AI-powered"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${notoSerifSC.variable} font-mixed antialiased`}
      >
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
