import { SITE_URL } from "./site-url";

export const SITE_CONFIG = {
  name: "Fayette Flyer",
  tagline: "First Class Local News",
  url: SITE_URL,
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
    timeZone: "America/New_York",
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
  defaultOgImage: `${SITE_URL}/og-fayette-flyer-v2.jpg`,

  // Default social preview video (8s silent loop) and its end-card still,
  // which doubles as the preview frame platforms show before/instead of playing it.
  defaultOgVideo: `${SITE_URL}/og-fayette-flyer.mp4`,
  defaultOgVideoPoster: `${SITE_URL}/og-fayette-flyer-video.jpg`,
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

/**
 * Open Graph media shared by every page that doesn't set its own.
 * og:image is the video's end-card still: Discord uses it as the preview frame,
 * and platforms that don't play og:video (iMessage, LinkedIn, X) show it instead.
 * og:video follows Facebook's spec: https URL + secure_url, video/mp4, width/height.
 */
export const DEFAULT_OG_MEDIA = {
  images: [
    {
      url: SITE_CONFIG.defaultOgVideoPoster,
      width: 1200,
      height: 630,
      alt: "Fayette Flyer - All of Fayette County, folded into a 5-minute read",
    },
  ],
  videos: [
    {
      url: SITE_CONFIG.defaultOgVideo,
      secureUrl: SITE_CONFIG.defaultOgVideo,
      type: "video/mp4",
      width: 1200,
      height: 630,
    },
  ],
};

export const DEFAULT_OG_TITLE = "Fayette Flyer | Fayette County GA News & Community Updates";
export const DEFAULT_OG_DESCRIPTION =
  "Your trusted source for Fayette County GA news. Local news, events, and community updates from Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey.";
