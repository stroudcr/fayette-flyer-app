import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { Header, Footer, SubscribeForm, JsonLd } from "@/components";
import { getIssueBySlug, getAdjacentIssues, getAllIssues } from "@/lib/beehiiv/posts";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);

  if (!issue) {
    return {
      title: "Issue Not Found",
    };
  }

  const description = issue.excerpt
    ? `${issue.excerpt.slice(0, 150)}... | Fayette County local news from Peachtree City, Fayetteville & more.`
    : `Read ${issue.title} - Fayette County GA local news and community updates.`;

  const articleUrl = `${SITE_CONFIG.url}/issues/${slug}`;

  return {
    title: issue.title,
    description,
    authors: issue.authors?.map((a) => ({ name: a.name })) || [{ name: "Fayette Flyer" }],
    openGraph: {
      title: `${issue.title} | Fayette Flyer`,
      description,
      type: "article",
      publishedTime: issue.publishDate.toISOString(),
      authors: issue.authors?.map((a) => a.name).filter((name): name is string => Boolean(name)) || ["Fayette Flyer"],
      section: "Local News",
      tags: ["Fayette County", "Georgia", "local news", "Peachtree City", "Fayetteville"],
      images: issue.thumbnailUrl
        ? [{ url: issue.thumbnailUrl, width: 1200, height: 630 }]
        : [{ url: `${SITE_CONFIG.url}/og-default.svg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description,
      images: [issue.thumbnailUrl || `${SITE_CONFIG.url}/og-default.svg`],
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export async function generateStaticParams() {
  try {
    const issues = await getAllIssues();
    return issues.map((issue) => ({
      slug: issue.slug,
    }));
  } catch {
    return [];
  }
}

export default async function IssuePage({ params }: Props) {
  const { slug } = await params;
  const [issue, adjacent] = await Promise.all([
    getIssueBySlug(slug),
    getAdjacentIssues(slug),
  ]);

  if (!issue) {
    notFound();
  }

  const formattedDate = issue.publishDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate structured data schemas
  const newsArticleSchema = generateNewsArticleSchema(issue, slug);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Issues", url: `${SITE_CONFIG.url}/issues` },
    { name: issue.title, url: `${SITE_CONFIG.url}/issues/${slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={newsArticleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        {/* Issue Header */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb navigation */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <Link href="/" className="text-slate hover:text-navy">
                    Home
                  </Link>
                </li>
                <li className="text-slate">/</li>
                <li>
                  <Link href="/issues" className="text-slate hover:text-navy">
                    Issues
                  </Link>
                </li>
                <li className="text-slate">/</li>
                <li className="text-navy font-medium truncate max-w-[200px]">
                  {issue.title}
                </li>
              </ol>
            </nav>

            <time
              dateTime={issue.publishDate.toISOString()}
              className="text-slate text-sm"
            >
              {formattedDate}
            </time>

            <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-navy mt-2 mb-4">
              {issue.title}
            </h1>

            {issue.subtitle && (
              <p className="text-slate text-xl">{issue.subtitle}</p>
            )}

            {/* Author byline */}
            {issue.authors && issue.authors.length > 0 && (
              <p className="text-slate text-sm mt-4">
                By {issue.authors.map((a) => a.name).filter(Boolean).join(", ") || "Fayette Flyer Staff"}
              </p>
            )}

            {/* Share Links */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
              <span className="text-sm text-slate">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(issue.title)}&url=${encodeURIComponent(`${SITE_CONFIG.url}/issues/${issue.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate hover:text-navy transition-colors"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_CONFIG.url}/issues/${issue.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate hover:text-navy transition-colors"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(issue.title)}&body=${encodeURIComponent(`Check out this issue of the Fayette Flyer: ${SITE_CONFIG.url}/issues/${issue.slug}`)}`}
                className="text-slate hover:text-navy transition-colors"
                aria-label="Share via Email"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Issue Content */}
        <article className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {issue.content ? (
              <div
                className="prose prose-lg prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(issue.content) }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate">
                  Content is not available. Please check back later.
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Subscribe CTA (after first section) */}
        <section className="py-8 bg-white border-y border-gray-200">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <SubscribeForm variant="card" />
          </div>
        </section>

        {/* Navigation between issues */}
        <section className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {adjacent.next ? (
                <Link
                  href={`/issues/${adjacent.next.slug}`}
                  className="card group flex-1"
                >
                  <div className="text-sm text-slate mb-1">← Previous Issue</div>
                  <div className="font-serif font-bold text-navy group-hover:text-navy-dark transition-colors">
                    {adjacent.next.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {adjacent.prev ? (
                <Link
                  href={`/issues/${adjacent.prev.slug}`}
                  className="card group flex-1 text-right"
                >
                  <div className="text-sm text-slate mb-1">Next Issue →</div>
                  <div className="font-serif font-bold text-navy group-hover:text-navy-dark transition-colors">
                    {adjacent.prev.title}
                  </div>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
