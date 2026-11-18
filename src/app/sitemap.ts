import { MetadataRoute } from "next";
import { getAllIssues } from "@/lib/beehiiv/posts";
import { SITE_URL } from "@/lib/seo/site-url";
import {
  CATEGORIES,
  DIRECTORY_PATH,
  businessHref,
  categoryHref,
  isBusinessIndexable,
  isCategoryIndexable,
  lastUpdated,
} from "@/lib/directory";
import { getGuideBusinesses } from "@/lib/directory/data";

/**
 * lastModified rules
 *
 * Google only trusts <lastmod> when it is "consistently and verifiably"
 * accurate, so every date here is the real date the page's content changed:
 * - Home, /issues and the events page change when a new issue publishes,
 *   so they use the newest issue's publish date.
 * - Guide pages use the newest addedAt/verifiedAt of the listings they show.
 * - Pages with no reliable change date (about, advertise, contact, privacy)
 *   leave lastModified out instead of claiming they changed "now".
 */
function guideDate(day: string | undefined): Date | undefined {
  return day ? new Date(`${day}T12:00:00Z`) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Issues come first: their dates also set the home, archive and events dates.
  let issues: Awaited<ReturnType<typeof getAllIssues>> = [];
  try {
    issues = await getAllIssues();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch issues for sitemap:", error);
    }
  }

  const newestIssueDate = issues.reduce<Date | undefined>(
    (newest, issue) => (!newest || issue.publishDate > newest ? issue.publishDate : newest),
    undefined
  );

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: newestIssueDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/issues`,
      lastModified: newestIssueDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/fayette-county-events`,
      lastModified: newestIssueDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/advertise`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Local Business Guide: the guide home, plus only the categories and
  // businesses that are indexable (empty categories and bare listings stay out).
  const guideBusinesses = await getGuideBusinesses();
  const guidePages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}${DIRECTORY_PATH}`,
      lastModified: guideDate(lastUpdated(guideBusinesses)),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...CATEGORIES.filter((c) => isCategoryIndexable(guideBusinesses, c.slug)).map((c) => ({
      url: `${SITE_URL}${categoryHref(c.slug)}`,
      lastModified: guideDate(lastUpdated(guideBusinesses.filter((b) => b.category === c.slug))),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...guideBusinesses.filter(isBusinessIndexable).map((b) => ({
      url: `${SITE_URL}${businessHref(b)}`,
      lastModified: guideDate(lastUpdated([b])),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  // Issue pages
  const issuePages: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `${SITE_URL}/issues/${issue.slug}`,
    lastModified: issue.publishDate,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...guidePages, ...issuePages];
}
