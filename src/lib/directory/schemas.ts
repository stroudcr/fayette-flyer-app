import { SITE_CONFIG } from "@/lib/seo/constants";
import {
  DAY_LABELS,
  DAY_ORDER,
  DIRECTORY_PATH,
  GUIDE_NAME,
  absoluteUrl,
  businessHref,
  categoryHref,
  streetLine,
} from "./index";
import type { Business, Category } from "./types";

const COUNTY_AREA = {
  "@type": "AdministrativeArea",
  name: `${SITE_CONFIG.location.county}, ${SITE_CONFIG.location.stateCode}`,
};

/** LocalBusiness (or a more specific subtype) for a business page. */
export function generateLocalBusinessSchema(business: Business, category: Category) {
  const url = absoluteUrl(businessHref(business));
  const hours = business.hours
    ? DAY_ORDER.flatMap((day) =>
        (business.hours?.[day] ?? []).map((interval) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${DAY_LABELS[day].long}`,
          opens: interval.opens,
          closes: interval.closes,
        }))
      )
    : [];

  return {
    "@context": "https://schema.org",
    "@type": category.schemaType,
    "@id": `${url}#business`,
    name: business.name,
    url: business.website ?? url,
    mainEntityOfPage: url,
    ...(business.tagline || business.description?.[0]
      ? { description: business.tagline ?? business.description?.[0] }
      : {}),
    ...(business.phone ? { telephone: business.phone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: streetLine(business),
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: "US",
    },
    areaServed: COUNTY_AREA,
    ...(business.photos?.length ? { image: business.photos.map((p) => absoluteUrl(p.src)) } : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
  };
}

/** CollectionPage + ItemList for a category page. */
export function generateCategorySchema(category: Category, businesses: Business[]) {
  const url = absoluteUrl(categoryHref(category.slug));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: `${category.heading} in ${SITE_CONFIG.location.county}, ${SITE_CONFIG.location.stateCode}`,
    url,
    isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
    about: COUNTY_AREA,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: businesses.length,
      itemListElement: businesses.map((business, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(businessHref(business)),
        name: business.name,
      })),
    },
  };
}

/** CollectionPage for the guide's home page, listing its categories. */
export function generateGuideSchema(categories: Category[]) {
  const url = absoluteUrl(DIRECTORY_PATH);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: `${SITE_CONFIG.name} ${GUIDE_NAME}`,
    description: `Local businesses in ${SITE_CONFIG.location.county}, Georgia, from the ${SITE_CONFIG.name}.`,
    url,
    isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
    publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
    about: COUNTY_AREA,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categories.length,
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(categoryHref(category.slug)),
        name: category.heading,
      })),
    },
  };
}
