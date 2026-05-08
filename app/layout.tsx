import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";
import InstallPrompt from "./components/InstallPrompt";

const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: "Audia - AI Podcast Summaries",
  description: "Transform hours of podcasts into minutes of clarity with AI-powered summaries. Your personal audio curator for the world's longest conversations.",
  keywords: ["podcast", "AI", "summary", "audio", "transcription", "voice synthesis", "productivity"],
  authors: [{ name: "Audia Labs" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Audia",
  },
  openGraph: {
    title: "Audia - AI Podcast Summaries",
    description: "Transform hours of podcasts into minutes of clarity",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audia - AI Podcast Summaries",
    description: "Transform hours of podcasts into minutes of clarity",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">{children}<InstallPrompt /></body>
    </html>
  );
}
