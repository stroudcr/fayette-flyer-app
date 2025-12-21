import { Metadata } from "next";
import { Header, Footer } from "@/components";
import { SITE_CONFIG } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "Contact | Fayette County News Tips & Inquiries",
  description:
    "Contact the Fayette Flyer with news tips, feedback, or advertising inquiries. We cover Fayette County GA including Peachtree City, Fayetteville, and Tyrone.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
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
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h2 className="font-serif font-bold text-xl text-navy mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Email</h3>
                    <a
                      href="mailto:chad@fayetteflyer.com"
                      className="text-navy hover:underline"
                    >
                      chad@fayetteflyer.com
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
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href={SITE_CONFIG.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate hover:text-navy transition-colors"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="font-serif font-bold text-xl text-navy mb-6">
                  Send a Message
                </h2>

                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent bg-white"
                    >
                      <option value="">Select a topic</option>
                      <option value="tip">News Tip</option>
                      <option value="feedback">Feedback</option>
                      <option value="advertising">Advertising Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                      placeholder="Your message..."
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>

                <p className="text-slate text-sm mt-4">
                  We typically respond within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
