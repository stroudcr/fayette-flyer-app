import { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components";
import { SITE_CONFIG } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "Advertise | Reach Fayette County Residents",
  description:
    "Advertise to engaged Fayette County residents. Sponsorship opportunities in our Peachtree City, Fayetteville, and Tyrone newsletter reaching local readers weekly.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/advertise`,
  },
};

export default function AdvertisePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-navy mb-4">
              Advertise with Us
            </h1>
            <p className="text-slate text-lg">
              Reach engaged Fayette County residents who care about their community.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <h2>Why Sponsor the Fayette Flyer?</h2>
              <p>
                The Fayette Flyer reaches an engaged audience of Fayette County
                residents who actively read our newsletter every week. Our readers
                are invested in their community and trust the Fayette Flyer as a
                reliable source of local information.
              </p>

              <h2>Sponsorship Benefits</h2>
              <ul>
                <li>
                  <strong>Targeted Reach:</strong> Your message goes directly to
                  Fayette County residents, the people most likely to become your
                  customers.
                </li>
                <li>
                  <strong>High Engagement:</strong> Newsletter readers are more
                  engaged than social media followers, with higher open and click
                  rates.
                </li>
                <li>
                  <strong>Community Credibility:</strong> Association with trusted
                  local content builds positive brand perception.
                </li>
                <li>
                  <strong>Flexible Formats:</strong> We offer various sponsorship
                  options to fit your budget and goals.
                </li>
              </ul>

              <h2>Sponsorship Options</h2>

              <h3>Newsletter Sponsorship</h3>
              <p>
                Your business featured prominently in the weekly newsletter with a
                dedicated section including your logo, description, and call to
                action.
              </p>

              <h3>Dedicated Email</h3>
              <p>
                A standalone email sent to our subscriber list featuring your
                business, event, or special offer.
              </p>

              <h3>Website Placement</h3>
              <p>
                Sponsor placement on our website&apos;s homepage and issue pages,
                reaching visitors browsing our content.
              </p>

              <h2>Who Should Advertise?</h2>
              <p>The Fayette Flyer is perfect for:</p>
              <ul>
                <li>Local restaurants and retail businesses</li>
                <li>Real estate agents and mortgage lenders</li>
                <li>Healthcare providers and dental practices</li>
                <li>Home services (plumbers, electricians, landscapers)</li>
                <li>Local events and festivals</li>
                <li>Professional services (attorneys, accountants, financial advisors)</li>
                <li>Nonprofits and community organizations</li>
              </ul>

              <h2>Get Started</h2>
              <p>
                Interested in reaching Fayette County residents? Contact us to
                discuss sponsorship options and pricing. We&apos;ll work with you to
                create a package that fits your goals and budget.
              </p>
            </div>

            {/* Contact CTA */}
            <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="font-serif font-bold text-xl text-navy mb-4">
                Ready to reach Fayette County?
              </h3>
              <p className="text-slate mb-6">
                Contact us to learn more about sponsorship opportunities.
              </p>
              <Link href="/contact" className="btn-primary inline-block">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
