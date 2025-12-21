import { Metadata } from "next";
import { Header, Footer, SubscribeForm, IssueCard, JsonLd } from "@/components";
import { getLatestIssues } from "@/lib/beehiiv/posts";
import type { Issue } from "@/lib/beehiiv/types";
import { generateWebsiteSchema } from "@/lib/seo/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Fayette County News | Local Updates from Peachtree City, Fayetteville & More",
  description:
    "Get free weekly Fayette County GA news delivered to your inbox. Covering Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey local news, events, and community updates.",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

export default async function HomePage() {
  // Fetch latest issues from Beehiiv
  let latestIssues: Issue[] = [];
  let featuredIssue: Issue | null = null;

  try {
    latestIssues = await getLatestIssues(6);
    featuredIssue = latestIssues[0] || null;
  } catch (error) {
    // Handle API error gracefully - show empty state
    console.error("Failed to fetch issues:", error);
  }

  const websiteSchema = generateWebsiteSchema();

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={websiteSchema} />

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-paper py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-navy mb-8">
              Fayette County News <br/> with Character
            </h1>

            {/* Starrs Mill landmark banner */}
            <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] mb-8">
              <Image
                src="/starrs-mill.jpg"
                alt="Starrs Mill, historic Fayette County landmark"
                width={1920}
                height={400}
                priority
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            </div>

            <p className="text-slate text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Stay connected with your community. Local news, events, and stories
              that matter to Fayette County residents. Delivered free to your inbox every week.
            </p>
            <div id="subscribe">
              <SubscribeForm variant="hero" />
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-slate">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Weekly Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Locally Focused</span>
              </div>
            </div>
            {/* Cities served for SEO */}
            <p className="text-slate/70 text-sm mt-6">
              Serving Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey
            </p>
          </div>
        </section>

        {/* Latest Issue Section */}
        {featuredIssue && (
          <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy">
                  Latest Issue
                </h2>
                <Link
                  href="/issues"
                  className="text-navy font-medium hover:underline text-sm"
                >
                  View all issues →
                </Link>
              </div>
              <IssueCard issue={featuredIssue} featured />
            </div>
          </section>
        )}

        {/* Recent Issues Section */}
        {latestIssues.length > 1 && (
          <section className="py-16 bg-paper">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy mb-8">
                Recent Issues
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestIssues.slice(1, 4).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
              {latestIssues.length > 4 && (
                <div className="text-center mt-8">
                  <Link href="/issues" className="btn-secondary inline-block">
                    View all issues
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy mb-6">
              Local News with Character
            </h2>
            <p className="text-slate text-lg mb-8 max-w-2xl mx-auto">
              The Fayette Flyer covers what matters most to our community—from local
              government decisions to small business openings, community events to
              high school sports. We&apos;re your neighbors, covering our neighbors.
            </p>
            <Link href="/about" className="btn-secondary inline-block">
              Learn more about us
            </Link>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-16 bg-paper">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy mb-4">
              Join Your Neighbors
            </h2>
            <p className="text-slate text-lg mb-8">
              Get the Fayette Flyer delivered to your inbox every week.
            </p>
            <SubscribeForm variant="hero" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
