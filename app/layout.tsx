import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "./components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">{children}<InstallPrompt /></body>
    </html>
  );
}
