import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { JsonLd } from "@/components";
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

export const viewport: Viewport = {
  themeColor: "#1c1e4d",
  colorScheme: "light",
};

export const metadata: Metadata = {
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
        width: 1584,
        height: 672,
        alt: "Fayette Flyer - Local News with Character for Fayette County, GA",
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
    icon: "/favicon.svg",
  },
  // Geo-targeting meta tags for local SEO
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

  return (
    <html lang="en">
      <head>
        <JsonLd data={organizationSchema} />
      </head>
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
