import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Rüya Bilinci - Rüya Yorumları ve Anlamları",
    template: "%s | Rüya Bilinci",
  },
  description:
    "Rüyanızın anlamını öğrenin. 45.000+ rüya tabiri ve yorumu ile Türkiye'nin en kapsamlı rüya tabirleri sitesi.",
  keywords: [
    "rüya tabirleri",
    "rüya yorumları",
    "rüya anlamları",
    "rüyada görmek",
    "rüya tabiri",
    "diyanet rüya tabirleri",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com"
  ),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Rüya Bilinci",
    title: "Rüya Bilinci - Rüya Yorumları ve Anlamları",
    description: "45.000+ rüya tabiri ve yorumu ile Türkiye'nin en kapsamlı rüya tabirleri sitesi.",
    url: "https://ruyabilinci.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rüya Bilinci",
    description: "Rüyalarınızın anlamını öğrenin",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://ruyabilinci.com",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="theme-color" content="#4f46e5" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
