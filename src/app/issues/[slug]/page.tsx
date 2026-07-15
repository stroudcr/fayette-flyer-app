import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { IssueContent } from "./IssueContent";
import { SubscribeForm, JsonLd, XTwitterIcon, FacebookIcon, EmailIcon } from "@/components";
import { getIssueBySlug, getIssuePageData, getAllIssues } from "@/lib/beehiiv/posts";
import { generateNewsArticleSchema, generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";

// Route Segment Config
// Enable dynamic params to allow new newsletter slugs not pre-generated at build time
export const dynamicParams = true;

// Revalidate every 5 minutes to match Beehiiv API cache timing
// This ensures pages stay fresh while maintaining good performance
export const revalidate = 300;

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
        : [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: issue.title,
      description,
      images: [issue.thumbnailUrl || SITE_CONFIG.defaultOgImage],
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
  const { issue, adjacent } = await getIssuePageData(slug);

  if (!issue) {
    notFound();
  }

  const formattedDate = issue.publishDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Extract plain text from HTML content for articleBody schema field
  const articleBody = issue.content
    ? issue.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000)
    : undefined;

  // Generate structured data schemas
  const newsArticleSchema = generateNewsArticleSchema(issue, slug, articleBody);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Issues", url: `${SITE_CONFIG.url}/issues` },
    { name: issue.title, url: `${SITE_CONFIG.url}/issues/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={newsArticleSchema} />
      <JsonLd data={breadcrumbSchema} />

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
                <XTwitterIcon />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_CONFIG.url}/issues/${issue.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate hover:text-navy transition-colors"
                aria-label="Share on Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(issue.title)}&body=${encodeURIComponent(`Check out this issue of the Fayette Flyer: ${SITE_CONFIG.url}/issues/${issue.slug}`)}`}
                className="text-slate hover:text-navy transition-colors"
                aria-label="Share via Email"
              >
                <EmailIcon />
              </a>
            </div>
          </div>
        </section>

        {/* Issue Content */}
        <article className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {issue.content ? (
              <IssueContent content={sanitizeHtml(issue.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption", "picture", "source", "video", "audio", "iframe"]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ["src", "alt", "width", "height", "loading", "decoding", "srcset", "sizes"],
                  iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "allow", "title"],
                  video: ["src", "controls", "width", "height", "poster"],
                  audio: ["src", "controls"],
                  source: ["src", "srcset", "type", "media", "sizes"],
                  a: ["href", "target", "rel", "title"],
                  "*": ["class", "id", "style"],
                },
                allowedStyles: {
                  "*": {
                    // Allow common safe styles but block font-family, max-width, and CSS custom properties
                    "color": [/.*/],
                    "background-color": [/.*/],
                    "text-align": [/.*/],
                    "padding": [/.*/],
                    "padding-top": [/.*/],
                    "padding-bottom": [/.*/],
                    "padding-left": [/.*/],
                    "padding-right": [/.*/],
                    "margin": [/.*/],
                    "margin-top": [/.*/],
                    "margin-bottom": [/.*/],
                    "margin-left": [/.*/],
                    "margin-right": [/.*/],
                    "width": [/.*/],
                    "height": [/.*/],
                    "border": [/.*/],
                    "border-radius": [/.*/],
                    "display": [/.*/],
                    "line-height": [/.*/],
                    "font-size": [/.*/],
                    "font-weight": [/.*/],
                  },
                },
                allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
              })} />
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
                  <div className="text-sm text-slate mb-1">&larr; Previous Issue</div>
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
                  <div className="text-sm text-slate mb-1">Next Issue &rarr;</div>
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
    </>
  );
}
