import { Metadata } from "next";
import { Header, Footer, IssueCard, SubscribeForm } from "@/components";
import { getAllIssues } from "@/lib/beehiiv/posts";
import type { Issue } from "@/lib/beehiiv/types";
import { SITE_CONFIG } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "News Archive | Fayette County GA Local News Issues",
  description:
    "Browse all Fayette County news issues. Read past coverage of Peachtree City, Fayetteville, Tyrone, and Brooks local news, events, and community stories.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/issues`,
  },
};

export default async function IssuesPage() {
  let issues: Issue[] = [];

  try {
    issues = await getAllIssues();
  } catch (error) {
    console.error("Failed to fetch issues:", error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-paper">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-navy mb-4">
              Archive
            </h1>
            <p className="text-slate text-lg max-w-2xl">
              Browse all past issues of the Fayette Flyer. Catch up on local news,
              events, and stories from Fayette County.
            </p>
          </div>
        </section>

        {/* Issues Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {issues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h2 className="font-serif font-bold text-xl text-navy mb-2">
                  No issues yet
                </h2>
                <p className="text-slate mb-6">
                  Subscribe to be the first to know when we publish.
                </p>
                <SubscribeForm variant="inline" className="max-w-md mx-auto" />
              </div>
            )}
          </div>
        </section>

        {/* Subscribe CTA */}
        {issues.length > 0 && (
          <section className="py-12 bg-white border-t border-gray-200">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-serif font-bold text-2xl text-navy mb-4">
                Never miss an issue
              </h2>
              <p className="text-slate mb-6">
                Get the Fayette Flyer delivered to your inbox every week.
              </p>
              <SubscribeForm variant="hero" />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
