export const SITE_CONFIG = {
  name: "Fayette Flyer",
  tagline: "Local News with Character",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.fayetteflyer.com",
  email: "info@fayetteflyer.com",
  locale: "en_US",

  // Location data for Fayette County, GA
  location: {
    county: "Fayette County",
    state: "Georgia",
    stateCode: "GA",
    country: "US",
    latitude: 33.4487,
    longitude: -84.4547,
  },

  // Cities served within Fayette County
  cities: [
    "Peachtree City",
    "Fayetteville",
    "Tyrone",
    "Brooks",
    "Woolsey",
  ] as const,

  // Social media profiles
  social: {
    facebook: "https://www.facebook.com/share/19D7g2U82i/",
    instagram: "https://instagram.com/fayetteflyer",
  },

  // Default images
  defaultOgImage: "https://www.fayetteflyer.com/og-default.jpg",
  logo: "https://www.fayetteflyer.com/FF_Logo.JPG",
  logoWidth: 600,
  logoHeight: 60,
};

export const TARGET_KEYWORDS = {
  primary: [
    "fayette county news",
    "fayette county ga news",
  ],
  secondary: [
    "peachtree city news",
    "fayetteville ga news",
    "tyrone ga news",
    "brooks ga news",
    "woolsey ga news",
  ],
  longTail: [
    "fayette county local news",
    "peachtree city georgia news",
    "fayette county community news",
    "south metro atlanta news",
    "fayette county events",
    "fayette county newsletter",
  ],
};

// Flattened keywords array for metadata
export const ALL_KEYWORDS = [
  ...TARGET_KEYWORDS.primary,
  ...TARGET_KEYWORDS.secondary,
  ...TARGET_KEYWORDS.longTail,
  "Fayette County",
  "Georgia",
  "local news",
  "newsletter",
  "community",
];
