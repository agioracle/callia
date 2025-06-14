import type { Metadata } from "next";
import { Newsreader, Noto_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Callia: Morning Brew - Personalized News Briefs",
  description: "Get personalized daily morning news briefs from your favorite sources. AI-powered news aggregation delivered to your inbox and available in text and audio formats.",
  keywords: ["news", "morning brief", "AI", "personalized", "daily news", "RSS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${notoSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
