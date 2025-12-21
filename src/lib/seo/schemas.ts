import { SITE_CONFIG } from "./constants";
import type { Issue } from "@/lib/beehiiv/types";

// Organization schema for the root layout (NewsMediaOrganization)
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: "The Fayette Flyer",
    url: SITE_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: SITE_CONFIG.logo,
      width: SITE_CONFIG.logoWidth,
      height: SITE_CONFIG.logoHeight,
    },
    image: SITE_CONFIG.defaultOgImage,
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.instagram,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE_CONFIG.email,
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Fayette County",
        addressRegion: "GA",
        addressCountry: "US",
      },
      ...SITE_CONFIG.cities.map((city) => ({
        "@type": "City",
        name: city,
        addressRegion: "GA",
        addressCountry: "US",
      })),
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_CONFIG.location.latitude,
      longitude: SITE_CONFIG.location.longitude,
    },
    foundingDate: "2025",
    description: `${SITE_CONFIG.location.county}'s trusted source for hyperlocal news, events, and community updates covering ${SITE_CONFIG.cities.join(", ")}, Georgia.`,
  };
}

// WebSite schema for homepage (helps with sitelinks in search)
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: `${SITE_CONFIG.location.county}'s trusted source for hyperlocal news and community updates`,
    inLanguage: "en-US",
    publisher: {
      "@id": `${SITE_CONFIG.url}/#organization`,
    },
  };
}

// NewsArticle schema for issue pages
export function generateNewsArticleSchema(issue: Issue, slug: string) {
  const articleUrl = `${SITE_CONFIG.url}/issues/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    headline: issue.title,
    description: issue.excerpt || `Read ${issue.title} from the Fayette Flyer.`,
    image: issue.thumbnailUrl || SITE_CONFIG.defaultOgImage,
    datePublished: issue.publishDate.toISOString(),
    dateModified: issue.publishDate.toISOString(),
    author: issue.authors?.length
      ? issue.authors.map((author) => ({
          "@type": "Person",
          name: author.name || "Fayette Flyer Staff",
        }))
      : [
          {
            "@type": "Organization",
            name: SITE_CONFIG.name,
          },
        ],
    publisher: {
      "@type": "NewsMediaOrganization",
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.logo,
        width: SITE_CONFIG.logoWidth,
        height: SITE_CONFIG.logoHeight,
      },
    },
    isAccessibleForFree: true,
    inLanguage: "en-US",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
    about: {
      "@type": "Place",
      name: `${SITE_CONFIG.location.county}, ${SITE_CONFIG.location.state}`,
    },
    keywords: [
      "Fayette County news",
      "Peachtree City",
      "Fayetteville",
      "local news",
      "Georgia",
    ],
  };
}

// BreadcrumbList schema for navigation
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
