import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_CONFIG } from "@/lib/seo/constants";
import styles from "./advertise.module.css";

const advertisingEmail = "advertise@fayetteflyer.com";

export const metadata: Metadata = {
  title: "Advertise | Reach Fayette County Residents",
  description:
    "Put your business in front of Fayette County locals. Explore Fayette Flyer's 2027 advertising options, from a sponsored event feature to a Presenting Partner.",
  alternates: { canonical: `${SITE_CONFIG.url}/advertise` },
};

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.arrow}>
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InquiryLink({ children, subject = "Advertising with Fayette Flyer", secondary = false }: {
  children: ReactNode;
  subject?: string;
  secondary?: boolean;
}) {
  return (
    <a className={`${styles.button} ${secondary ? styles.secondaryButton : ""}`}
      href={`mailto:${advertisingEmail}?subject=${encodeURIComponent(subject)}`}>
      {children}<Arrow />
    </a>
  );
}

function AdvertisingOption({ id, title, price, frequency = "/month", lead, includes, cta, featured = false, dark = false, children }: {
  id: string;
  title: string;
  price: string;
  frequency?: string;
  lead: string;
  includes: string[];
  cta: string;
  featured?: boolean;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <article aria-labelledby={`${id}-title`} id={id}
      className={`${styles.option} ${featured ? styles.featuredOption : ""} ${dark ? styles.darkOption : ""}`}>
      <div className={`${styles.container} ${styles.optionGrid}`}>
        <h3 id={`${id}-title`} className={styles.optionTitle}>{title}</h3>
        <p className={styles.price}>
          <span>{price}</span><span className={styles.frequency}>{frequency}</span>
        </p>
        <div className={styles.optionCopy}>
          <p className={styles.lead}><strong>{lead}</strong></p>
          {children}
        </div>
        <div className={styles.inclusions}>
          <h4>Includes:</h4>
          <ul>
            {includes.map((item) => (
              <li key={item}>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                  <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <InquiryLink subject={`2027 ${title} inquiry`} secondary={!featured && !dark}>{cta}</InquiryLink>
        </div>
      </div>
    </article>
  );
}

export default function AdvertisePage() {
  return (
    <main className={styles.page}>
      <section aria-labelledby="advertise-title" className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <h1 id="advertise-title">Advertise with <em>Fayette Flyer</em></h1>
            <p className={styles.subtitle}>Put your business in front of Fayette County locals.</p>
          </div>
          <div className={styles.heroCopy}>
            <p>
              Fayette Flyer is a twice-weekly local publication built specifically
              for people who live, work, shop, eat, own homes, raise families, and
              make decisions right here in Fayette County.
            </p>
            <p>
              Instead of competing for attention in a crowded social media feed,
              your business shows up directly alongside the local information our
              readers already make time to read.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.button} href="#advertising-options">Explore advertising options<Arrow /></a>
              <a className={styles.textLink} href="#lets-talk">Let&apos;s talk<Arrow /></a>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.statsBand}>
        <ul className={`${styles.container} ${styles.stats}`} aria-label="Fayette Flyer readership">
          <li><strong>2,000+</strong><span>local subscribers</span></li>
          <li><strong>60%+</strong><span>typical open rates</span></li>
          <li><strong>Two</strong><span>issues every week</span></li>
          <li><strong>100%</strong><span>focused on Fayette County</span></li>
        </ul>
      </div>

      <section aria-labelledby="advertising-options" className={styles.options}>
        <div className={`${styles.container} ${styles.optionsIntro}`}>
          <h2 id="advertising-options">2027 Advertising Options</h2>
          <p>
            We keep advertising intentionally limited. Fayette Flyer isn&apos;t built
            around filling every available inch with ads, and we think that&apos;s
            better for both our readers and our advertisers.
          </p>
        </div>

        <AdvertisingOption
          id="local-business-spotlight"
          title="Local Business Spotlight"
          price="$450"
          lead="Our most popular option, and where we'd recommend most local businesses start."
          includes={["4 Fayette Flyer placements", "Custom-written or edited copy", "Photo or logo", "Direct link and call to action", "Category exclusivity", "Campaign performance recap"]}
          cta="Ask about the Spotlight"
          featured
        >
          <p>
            Your business gets four native advertising features over a four-week
            campaign, giving you repeated exposure without showing up so often
            that readers tune you out.
          </p>
          <p>
            Each placement is written or refined in the Fayette Flyer voice and
            can include your photo or logo, a direct link, and a clear call to action.
          </p>
          <p>
            Your campaign also includes category exclusivity. While your Spotlight
            campaign is active, we won&apos;t run another Local Business Spotlight
            from a direct competitor in your category.
          </p>
          <p>You&apos;ll receive a performance recap after your campaign.</p>
        </AdvertisingOption>

        <AdvertisingOption
          id="presenting-partner"
          title="Presenting Partner"
          price="$800"
          lead="The biggest presence we offer."
          includes={["Placement in every issue that month", "Approximately 8 newsletter appearances", "Premium top-of-publication positioning", "Custom sponsor messaging", "Logo/photo and links", "Category exclusivity", "Instagram exposure", "Monthly performance recap"]}
          cta="Ask about a partnership"
          dark
        >
          <p>Become the Presenting Partner of Fayette Flyer for an entire month.</p>
          <p>
            Your business receives premium placement across every Fayette Flyer
            issue that month, putting your name in front of readers approximately
            eight times throughout the campaign.
          </p>
          <div className={styles.sponsorExample}>
            <p>Think:</p>
            <blockquote><strong>“Today&apos;s Fayette Flyer is presented by [Your Business].”</strong></blockquote>
          </div>
          <p>
            Your partnership includes prominent branding, custom sponsor
            messaging, links to your business, category exclusivity, performance
            reporting, and additional visibility through Fayette Flyer&apos;s social media.
          </p>
          <p>There is only <strong>one Presenting Partner available per month.</strong></p>
          <p>When a month is booked, it&apos;s booked.</p>
        </AdvertisingOption>

        <AdvertisingOption
          id="section-partner"
          title="Section Partner"
          price="$250"
          lead="An affordable way to stay consistently visible to Fayette County."
          includes={["Presence throughout the month", "Approximately 8 appearances", "Logo/business name", "Direct link", "Recurring section placement", "Category exclusivity"]}
          cta="Ask about a section"
        >
          <p>Put your business alongside one of the recurring parts of Fayette Flyer readers already recognize.</p>
          <p>
            Your business receives a <strong>“Presented by”</strong> or <strong>“Brought to you by”</strong> placement
            at the beginning of the sponsored section throughout the month.
          </p>
          <div className={styles.sectionList}>
            <p>Potential sections include:</p>
            <ul>
              <li>WHAT&apos;S HAPPENIN&apos;</li>
              <li>THE DIGEST</li>
              <li>WEATHER</li>
              <li>DOG OF THE WEEK</li>
              <li>CIVIL NEWS</li>
            </ul>
          </div>
          <p>
            Section Partnerships are intentionally subtle. You&apos;re not
            interrupting the publication with another large advertisement.
            You&apos;re associating your business with something readers already
            come to Fayette Flyer for.
          </p>
          <p>Each section is limited to <strong>one partner at a time</strong>, with category exclusivity.</p>
        </AdvertisingOption>

        <AdvertisingOption
          id="sponsored-event-feature"
          title="Sponsored Event Feature"
          price="$50"
          frequency="one-time"
          lead="Have something happening that Fayette County should know about?"
          includes={["One sponsored feature", "Custom-written or edited copy", "Photo", "Direct link", "Prominent placement in one issue"]}
          cta="Tell us about your event"
        >
          <p>
            This option is designed for grand openings, community events, open
            houses, special promotions, anniversary celebrations, fundraisers,
            and other time-sensitive happenings.
          </p>
          <p>
            We&apos;ll create an editorial-style sponsored feature with your photo,
            event information, and a direct link, then place it in a Fayette Flyer
            issue ahead of your event or promotion.
          </p>
          <p>No monthly commitment required.</p>
        </AdvertisingOption>
      </section>

      <section id="lets-talk" aria-labelledby="lets-talk-title" className={styles.contact}>
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <h2 id="lets-talk-title">Not sure which one makes sense?</h2>
          <div className={styles.contactCopy}>
            <p className={styles.lead}>Tell us about your business and what you&apos;re trying to accomplish.</p>
            <p>
              If you&apos;re testing Fayette Flyer for the first time, we&apos;ll
              tell you where we&apos;d start. If you&apos;re trying to build
              consistent recognition throughout Fayette County, we&apos;ll point
              you toward a campaign. And if one of the larger packages doesn&apos;t
              make sense for what you&apos;re trying to accomplish, we&apos;ll tell
              you that too.
            </p>
            <p>Our goal isn&apos;t to sell you the biggest package.</p>
            <p>It&apos;s to help local businesses find an advertising option that actually makes sense for them.</p>
            <InquiryLink>Let&apos;s talk about your business</InquiryLink>
            <a className={styles.emailLink} href={`mailto:${advertisingEmail}`}>{advertisingEmail}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
