import { Metadata } from "next";
import { SubscribeForm, IssueCard, JsonLd } from "@/components";
import { getLatestIssues } from "@/lib/beehiiv/posts";
import type { Issue } from "@/lib/beehiiv/types";
import { generateWebsiteSchema } from "@/lib/seo/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Fayette County News | Local Updates from Peachtree City, Fayetteville & More",
  description:
    "Get free twice-a-week Fayette County GA news delivered to your inbox. Covering Peachtree City, Fayetteville, Tyrone, Brooks & Woolsey local news, events, and community updates.",
  alternates: {
    canonical: SITE_CONFIG.url,
  },
};

export default async function HomePage() {
  let latestIssues: Issue[] = [];
  let featuredIssue: Issue | null = null;

  try {
    latestIssues = await getLatestIssues(6);
    featuredIssue = latestIssues[0] || null;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch issues:", error);
    }
  }

  const websiteSchema = generateWebsiteSchema();

  return (
    <main className="flex-1">
      <JsonLd data={websiteSchema} />

      <section className="relative isolate overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <div className="hero-image-drift absolute inset-0">
            <Image
              src="/starrs-mill.jpg"
              alt="Starrs Mill, historic Fayette County landmark"
              fill
              quality={75}
              sizes="100vw"
              priority
              className="object-cover object-[58%_center]"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,22,57,0.96)_0%,rgba(21,22,57,0.9)_42%,rgba(21,22,57,0.7)_62%,rgba(21,22,57,0.38)_80%,rgba(21,22,57,0.18)_100%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,22,57,0.18)_0%,rgba(21,22,57,0)_24%,rgba(21,22,57,0.2)_100%)]"></div>
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl text-white">
            <div className="hero-fade-up mb-5 flex items-center gap-3 sm:mb-6 sm:gap-4">
              <div className="h-px w-10 bg-gold/70 sm:w-20"></div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90 sm:text-[11px]">
                Fayette County, Georgia
              </span>
            </div>

            <p className="hero-fade-up hero-fade-up-delay-1 mb-3 max-w-xl font-display text-[clamp(1.85rem,4vw,3.35rem)] font-black uppercase tracking-[0.06em] text-white sm:mb-4">
              The Fayette Flyer
            </p>

            <h1 className="hero-fade-up hero-fade-up-delay-2 max-w-[10ch] font-serif text-[clamp(2.75rem,5.1vw,4.3rem)] font-semibold leading-[0.94] text-white drop-shadow-[0_2px_18px_rgba(12,14,34,0.3)] sm:max-w-[11ch]">
              First Class Local News
            </h1>

            <p className="hero-fade-up hero-fade-up-delay-2 mt-4 max-w-xl text-base leading-7 text-white/[0.86] sm:mt-5 sm:max-w-lg sm:text-[1.05rem] sm:leading-7">
              Twice a week, we cover the local decisions, events, and stories shaping
              Peachtree City, Fayetteville, Tyrone, Brooks, and Woolsey.
            </p>

            <div id="subscribe" className="hero-fade-up hero-fade-up-delay-3 mt-5 sm:mt-6">
              <SubscribeForm
                variant="hero"
                theme="inverse"
                showHelperText={false}
                className="max-w-xl"
              />
            </div>

            <p className="hero-fade-up hero-fade-up-delay-3 mt-5 border-t border-white/[0.16] pt-3 text-xs uppercase tracking-[0.18em] text-white/[0.72] sm:mt-6 sm:pt-4 sm:text-sm">
              Free twice-a-week delivery • No paywall • Peachtree City • Fayetteville •
              Tyrone • Brooks • Woolsey
            </p>
          </div>
        </div>
      </section>

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

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy mb-6">
            Local News with Character
          </h2>
          <p className="text-slate text-lg mb-8 max-w-2xl mx-auto">
            The Fayette Flyer covers what matters most to our community. From local
            government decisions to small business openings, community events to
            high school sports. We&apos;re your neighbors, covering our neighbors.
          </p>
          <Link href="/about" className="btn-secondary inline-block">
            Learn more about us
          </Link>
        </div>
      </section>

      <section className="py-16 bg-paper">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-navy mb-4">
            Join Your Neighbors
          </h2>
          <p className="text-slate text-lg mb-8">
            Get the Fayette Flyer delivered to your inbox twice a week.
          </p>
          <SubscribeForm variant="hero" />
        </div>
      </section>
    </main>
  );
}
