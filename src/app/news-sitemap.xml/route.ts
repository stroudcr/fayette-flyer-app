import { getAllIssues } from "@/lib/beehiiv/posts";
import type { Issue } from "@/lib/beehiiv/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fayetteflyer.com";

export const revalidate = 300; // 5 minutes

export async function GET() {
  let issues: Issue[];
  try {
    issues = await getAllIssues();
  } catch {
    issues = [];
  }

  // Google News sitemaps only include articles from the last 48 hours
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentIssues = issues.filter((issue) => issue.publishDate >= cutoff);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentIssues
  .map(
    (issue) => `  <url>
    <loc>${SITE_URL}/issues/${issue.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Fayette Flyer</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${issue.publishDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(issue.title)}</news:title>
      <news:keywords>Fayette County, Peachtree City, Fayetteville, Georgia, local news</news:keywords>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
