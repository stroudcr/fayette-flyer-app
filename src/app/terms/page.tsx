import { Metadata } from "next";
import { Header, Footer } from "@/components";
import { SITE_CONFIG } from "@/lib/seo/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for the Fayette Flyer newsletter and website.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-navy mb-4">
              Terms of Service
            </h1>
            <p className="text-slate">Last updated: December 21, 2025</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 bg-paper">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-slate max-w-none">
              <h2>Introduction</h2>
              <p>
                Welcome to Fayette Flyer. These Terms of Service
                (&quot;Terms&quot;) govern your access to and use of our website
                located at{" "}
                <a
                  href="https://www.fayetteflyer.com"
                  className="text-navy hover:underline"
                >
                  www.fayetteflyer.com
                </a>{" "}
                and our newsletter service. By accessing or using our services,
                you agree to be bound by these Terms.
              </p>

              <h2>Acceptance of Terms</h2>
              <p>
                By accessing our website, subscribing to our newsletter, or
                using any of our services, you acknowledge that you have read,
                understood, and agree to be bound by these Terms. If you do not
                agree to these Terms, please do not use our services.
              </p>

              <h2>Use of Website</h2>
              <p>
                Our website and newsletter are provided for your personal,
                non-commercial use. You may:
              </p>
              <ul>
                <li>Access and read our content</li>
                <li>Subscribe to our newsletter</li>
                <li>Share our content through provided social sharing features</li>
                <li>Contact us with news tips or inquiries</li>
              </ul>
              <p>You may not:</p>
              <ul>
                <li>
                  Use our services for any unlawful purpose or in violation of
                  these Terms
                </li>
                <li>
                  Republish, redistribute, or reproduce our content without
                  permission
                </li>
                <li>
                  Attempt to gain unauthorized access to our systems or networks
                </li>
                <li>
                  Use automated systems or software to extract data from our
                  website
                </li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
              </ul>

              <h2>Newsletter Subscription</h2>
              <p>
                Our newsletter is a free service delivered weekly to subscribers.
                By subscribing, you agree to:
              </p>
              <ul>
                <li>Receive our weekly newsletter via email</li>
                <li>
                  Allow us to collect your email address and subscription
                  metadata
                </li>
                <li>
                  Have your information stored and processed by Beehiiv, our
                  third-party email service provider
                </li>
              </ul>
              <p>
                You may unsubscribe at any time by clicking the unsubscribe link
                in any newsletter email. Your subscription is subject to
                Beehiiv&apos;s terms and privacy policies.
              </p>

              <h2>Content & Intellectual Property</h2>
              <p>
                All content published on Fayette Flyer, including but not limited
                to articles, images, graphics, logos, and design elements, is
                owned by or licensed to Fayette Flyer and is protected by
                copyright and intellectual property laws.
              </p>
              <p>
                You may link to our content and share articles through social
                media, but you may not reproduce, distribute, or create
                derivative works from our content without express written
                permission.
              </p>

              <h2>User Submissions</h2>
              <p>
                When you submit content to us through our contact form, news tips
                email, or other communication channels, you grant us a
                non-exclusive, royalty-free, perpetual license to use, modify,
                and publish that content as part of our news coverage.
              </p>
              <p>
                You represent and warrant that any content you submit:
              </p>
              <ul>
                <li>Is accurate to the best of your knowledge</li>
                <li>Does not violate any third-party rights</li>
                <li>Does not contain defamatory or illegal material</li>
                <li>
                  Is your original work or you have permission to share it
                </li>
              </ul>

              <h2>Advertising & Sponsorships</h2>
              <p>
                Fayette Flyer may display advertisements and sponsored content.
                Advertisers and sponsors agree to:
              </p>
              <ul>
                <li>
                  Provide accurate and non-misleading advertising content
                </li>
                <li>Comply with all applicable advertising laws and regulations</li>
                <li>
                  Obtain all necessary rights and permissions for their content
                </li>
              </ul>
              <p>
                We reserve the right to reject or remove any advertising or
                sponsored content that we deem inappropriate or that violates
                these Terms.
              </p>

              <h2>Third-Party Services</h2>
              <p>
                Our services utilize third-party providers, including:
              </p>
              <ul>
                <li>
                  <strong>Beehiiv</strong> - Newsletter delivery and subscriber
                  management
                </li>
                <li>
                  <strong>Vercel</strong> - Website hosting and deployment
                </li>
              </ul>
              <p>
                Your use of our services is also subject to the terms and privacy
                policies of these third-party providers. We are not responsible
                for the practices or policies of third-party services.
              </p>

              <h2>Disclaimers</h2>
              <p>
                Fayette Flyer provides news and information &quot;as is&quot; and
                &quot;as available.&quot; While we strive for accuracy, we make
                no warranties or representations regarding:
              </p>
              <ul>
                <li>The accuracy, completeness, or timeliness of our content</li>
                <li>The availability or reliability of our website</li>
                <li>The suitability of our services for any particular purpose</li>
              </ul>
              <p>
                Our content is for informational purposes only and should not be
                considered professional advice. Always verify important
                information and consult qualified professionals for specific
                advice.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Fayette Flyer and its
                operators, employees, and affiliates shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages
                arising from your use of our services, including but not limited
                to:
              </p>
              <ul>
                <li>Loss of data or information</li>
                <li>Loss of revenue or profits</li>
                <li>Business interruption</li>
                <li>Errors or omissions in our content</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount you paid for our
                services (which is currently $0 for newsletter subscriptions).
              </p>

              <h2>User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Harass, abuse, or harm other users or our staff</li>
                <li>
                  Submit spam, unsolicited advertising, or promotional materials
                </li>
                <li>
                  Impersonate any person or entity or misrepresent your
                  affiliation
                </li>
                <li>
                  Interfere with the proper functioning of our website or services
                </li>
                <li>Violate any applicable local, state, or federal laws</li>
              </ul>

              <h2>Cookies & Tracking</h2>
              <p>
                Our website and hosting provider (Vercel) may use essential
                cookies for functionality and performance. By using our website,
                you consent to the use of cookies as described in our{" "}
                <a href="/privacy" className="text-navy hover:underline">
                  Privacy Policy
                </a>
                .
              </p>

              <h2>Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify users of significant changes by updating the &quot;Last
                updated&quot; date at the top of this page. Your continued use of
                our services after changes are posted constitutes your acceptance
                of the modified Terms.
              </p>

              <h2>Termination</h2>
              <p>
                We reserve the right to terminate or suspend your access to our
                services at any time, without notice, for conduct that we believe
                violates these Terms or is harmful to other users, us, or third
                parties, or for any other reason at our sole discretion.
              </p>

              <h2>Governing Law & Venue</h2>
              <p>
                These Terms shall be governed by and construed in accordance with
                the laws of the State of Georgia, United States, without regard
                to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of our services
                shall be resolved in the courts of Fayette County, Georgia. You
                consent to the personal jurisdiction and venue of such courts.
              </p>

              <h2>Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or
                invalid, that provision shall be limited or eliminated to the
                minimum extent necessary, and the remaining provisions shall
                remain in full force and effect.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact
                us at:
              </p>
              <p>
                <a
                  href="mailto:info@fayetteflyer.com"
                  className="text-navy hover:underline"
                >
                  info@fayetteflyer.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
