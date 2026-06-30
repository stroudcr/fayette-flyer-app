import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Header, Footer, JsonLd, MetaPixel } from "@/components";
import { generateOrganizationSchema } from "@/lib/seo/schemas";
import { ALL_KEYWORDS, SITE_CONFIG } from "@/lib/seo/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#1c1e4d",
  colorScheme: "light",
};

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  title: {
    default: "Fayette Flyer | Fayette County GA News & Community Updates",
    template: "%s | Fayette Flyer - Fayette County News",
  },
  description:
    "Your trusted source for Fayette County GA news. Local news, events, and community updates from Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey. Free weekly newsletter.",
  keywords: ALL_KEYWORDS,
  authors: [{ name: "Fayette Flyer" }],
  creator: "Fayette Flyer",
  publisher: "Fayette Flyer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: "Fayette Flyer | Fayette County GA News & Community Updates",
    description:
      "Your trusted source for Fayette County GA news. Local news, events, and community updates from Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey.",
    images: [
      {
        url: `${SITE_CONFIG.url}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Fayette Flyer - First Class Local News for Fayette County, GA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fayette Flyer | Fayette County GA News",
    description:
      "Your trusted source for Fayette County GA news. Local news from Peachtree City, Fayetteville, Tyrone & more.",
    images: [`${SITE_CONFIG.url}/og-default.jpg`],
  },
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "geo.region": "US-GA",
    "geo.placename": "Fayette County, Georgia",
    "geo.position": `${SITE_CONFIG.location.latitude};${SITE_CONFIG.location.longitude}`,
    ICBM: `${SITE_CONFIG.location.latitude}, ${SITE_CONFIG.location.longitude}`,
    "content-language": "en-US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const shouldRenderVercelAnalytics = process.env.VERCEL === "1";

  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZYE5GCMYJF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZYE5GCMYJF');
          `}
        </Script>
        <JsonLd data={organizationSchema} />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} ${playfairDisplay.variable} antialiased`}>
        <MetaPixel pixelId={metaPixelId} />
        <div className="min-h-screen flex flex-col">
          <Header />
          {children}
          <Footer />
        </div>
        {shouldRenderVercelAnalytics && <Analytics />}
      </body>
    </html>
  );
}
