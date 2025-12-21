import { MetadataRoute } from "next";
import { getAllIssues } from "@/lib/beehiiv/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fayetteflyer.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/issues`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/advertise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic issue pages
  let issuePages: MetadataRoute.Sitemap = [];

  try {
    const issues = await getAllIssues();
    issuePages = issues.map((issue) => ({
      url: `${SITE_URL}/issues/${issue.slug}`,
      lastModified: issue.publishDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch issues for sitemap:", error);
    }
  }

  return [...staticPages, ...issuePages];
}
