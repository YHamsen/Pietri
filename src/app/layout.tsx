import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import WelcomePopup from "@/components/WelcomePopup";
import ChatWidget from "@/components/ChatWidget";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export const metadata: Metadata = {
  title: "PIETRI — Streetwear Africain Premium | Drops Limités",
  description: "PIETRI — Streetwear premium inspiré de la culture africaine. Hoodies oversize, tees brodés, robes florales. Livraison Abidjan & international. Éditions limitées.",
  keywords: "PIETRI, streetwear africain, streetwear Abidjan, mode Côte d'Ivoire, hoodie oversize, broderie, drop limité, mode afro",
  openGraph: {
    title: "PIETRI — Streetwear Africain Premium",
    description: "Drops limités, broderies artisanales, culture africaine. Livraison Abidjan & mondial.",
    url: "https://pietri.io",
    siteName: "PIETRI",
    type: "website",
    images: [{ url: "https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png", width: 1200, height: 630, alt: "PIETRI Streetwear" }],
  },
  twitter: { card: "summary_large_image", title: "PIETRI — Streetwear Africain", description: "Drops limités. Culture africaine. Premium." },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          "name": "PIETRI",
          "description": "Streetwear africain premium — drops limités, broderies artisanales",
          "url": "https://pietri.io",
          "priceRange": "€49 - €89",
          "areaServed": ["CI", "FR", "BE", "CA"],
          "currenciesAccepted": "EUR, XOF",
          "paymentAccepted": "Mobile Money, Carte bancaire",
        }) }} />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', sans-serif", margin: 0, padding: 0 }}>
        <LanguageProvider>
          <CurrencyProvider>
            <AnalyticsTracker />
            <WelcomePopup />
            {children}
            <ChatWidget />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
