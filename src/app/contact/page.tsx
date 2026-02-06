import { Metadata } from "next";
import { FacebookIcon, InstagramIcon, JsonLd } from "@/components";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { generateContactPageSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
  title: "Contact | Fayette County News Tips & Inquiries",
  description:
    "Contact the Fayette Flyer with news tips, feedback, or advertising inquiries. We cover Fayette County GA including Peachtree City, Fayetteville, and Tyrone.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactPage() {
  const contactPageSchema = generateContactPageSchema();

  return (
    <main className="flex-1">
      <JsonLd data={contactPageSchema} />
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-navy mb-4">
            Contact Us
          </h1>
          <p className="text-slate text-lg">
            Have a tip, question, or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Info */}
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif font-bold text-xl text-navy mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-navy mb-2">Email</h3>
                <a
                  href="mailto:info@fayetteflyer.com"
                  className="text-navy hover:underline"
                >
                  info@fayetteflyer.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-2">News Tips</h3>
                <p className="text-slate text-sm mb-2">
                  Have a story idea or news tip? We want to hear about it.
                </p>
                <a
                  href="mailto:tips@fayetteflyer.com"
                  className="text-navy hover:underline"
                >
                  tips@fayetteflyer.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-2">Advertising</h3>
                <p className="text-slate text-sm mb-2">
                  Interested in reaching Fayette County residents?
                </p>
                <a
                  href="mailto:advertise@fayetteflyer.com"
                  className="text-navy hover:underline"
                >
                  advertise@fayetteflyer.com
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-navy mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href={SITE_CONFIG.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate hover:text-navy transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  href={SITE_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate hover:text-navy transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
