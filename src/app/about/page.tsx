import { Metadata } from "next";
import { Header, Footer, SubscribeForm } from "@/components";
import { SITE_CONFIG } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "About | Your Local Fayette County News Source",
  description:
    "Learn about the Fayette Flyer, Fayette County Georgia's trusted hyperlocal newsletter covering Peachtree City, Fayetteville, Tyrone, and surrounding communities.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-navy mb-4">
              About the Fayette Flyer
            </h1>
            <p className="text-slate text-lg">
              Local news with character, delivered weekly.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <h2>Our Mission</h2>
              <p>
                The Fayette Flyer exists to keep Fayette County residents informed
                about what matters most in their community. From local government
                decisions that affect your daily life to small business openings,
                community events, and high school sports—we cover the stories that
                bring our neighbors together.
              </p>

              <h2>Why We Started</h2>
              <p>
                In an age of national headlines and algorithmic feeds, local news
                often gets lost. We believe that the stories happening in our own
                backyard deserve attention. Fayette County is a special place, and
                the people who live here deserve a reliable source of local
                information.
              </p>

              <h2>What We Cover</h2>
              <ul>
                <li>
                  <strong>Local Government:</strong> County commission meetings,
                  city council decisions, zoning changes, and public policy that
                  affects your community.
                </li>
                <li>
                  <strong>Community Events:</strong> Festivals, fundraisers,
                  concerts, and gatherings that bring Fayette County together.
                </li>
                <li>
                  <strong>Business News:</strong> New openings, closings, and the
                  entrepreneurs building businesses in our community.
                </li>
                <li>
                  <strong>Schools & Sports:</strong> Updates from Fayette County
                  schools, including high school athletics and academic
                  achievements.
                </li>
                <li>
                  <strong>People & Places:</strong> The stories of neighbors doing
                  remarkable things and the places that make Fayette County unique.
                </li>
              </ul>

              <h2>Our Commitment</h2>
              <p>
                We&apos;re committed to accurate, fair, and timely reporting. We
                don&apos;t have a political agenda—we simply want to inform our
                neighbors about what&apos;s happening in our shared community. When
                we make mistakes, we correct them promptly and transparently.
              </p>

              <h2>Stay Connected</h2>
              <p>
                The Fayette Flyer is delivered free to your inbox every week.
                Subscribe below to never miss an issue.
              </p>
            </div>

            {/* Subscribe Form */}
            <div className="mt-12">
              <SubscribeForm variant="card" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
