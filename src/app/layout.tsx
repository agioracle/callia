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
  title: "Briefily - Personalized news briefings Powered by AI",
  description: "Get personalized morning news briefings from your favorite news sources. AI-powered news aggregation and summarization delivered to your inbox and available in text and audio formats.",
  keywords: ["news briefing", "news brief", "morning briefing", "morning brief", "personalized", "AI-powered"],
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
