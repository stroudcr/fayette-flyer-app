import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/seo/constants";
import styles from "./advertise.module.css";
import { PresentingPartnerExample } from "./PresentingPartnerExample";
import { SectionPartnerExample } from "./SectionPartnerExample";

const advertisingEmail = "advertise@fayetteflyer.com";

export const metadata: Metadata = {
  title: "Advertise | Reach Fayette County Residents",
  description:
    "Put your business in front of Fayette County locals. Explore Fayette Flyer's 2027 advertising options, from a featured event to a Presenting Partner.",
  alternates: { canonical: `${SITE_CONFIG.url}/advertise` },
};

// Presenting Partner packages, shown highest first. Every package gets the
// same placement; they differ only in how many issues they run in.
const presentingPartnerTiers = [
  { features: 8, price: "$640", perFeature: "$80", schedule: "8 issues in a row, about a month", instagram: true, recommended: false },
  { features: 4, price: "$360", perFeature: "$90", schedule: "4 issues in a row: Mon, Thu, Mon, Thu", instagram: true, recommended: true },
  { features: 2, price: "$200", perFeature: "$100", schedule: "2 issues", instagram: false, recommended: false },
];

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.arrow}>
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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

function IncludesList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <Check />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AdvertisingOption({ id, title, price, frequency = "/month", tiers, lead, includes, includesHeading = "Includes:", cta, featured = false, dark = false, children }: {
  id: string;
  title: string;
  price?: string;
  frequency?: string;
  tiers?: ReactNode;
  lead: string;
  includes: string[];
  includesHeading?: string;
  cta: string;
  featured?: boolean;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <article aria-labelledby={`${id}-title`} id={id}
      className={`${styles.option} ${featured ? styles.featuredOption : ""} ${dark ? styles.darkOption : ""}`}>
      <div className={`${styles.container} ${styles.optionGrid} ${tiers ? styles.tieredGrid : ""}`}>
        <h3 id={`${id}-title`} className={styles.optionTitle}>{title}</h3>
        {price && (
          <p className={styles.price}>
            <span>{price}</span><span className={styles.frequency}>{frequency}</span>
          </p>
        )}
        {tiers}
        <div className={styles.optionCopy}>
          <p className={styles.lead}><strong>{lead}</strong></p>
          {children}
        </div>
        <div className={styles.inclusions}>
          <h4>{includesHeading}</h4>
          <IncludesList items={includes} />
          <InquiryLink subject={`2027 ${title} inquiry`} secondary={!featured && !dark}>{cta}</InquiryLink>
        </div>
      </div>
    </article>
  );
}

function PresentingPartnerTiers() {
  return (
    <div className={styles.tiers}>
      <p className={styles.tierIntro}>Choose how many issues you want.</p>
      <ul className={styles.tierList} aria-label="Presenting Partner packages">
        {presentingPartnerTiers.map((tier) => (
          <li key={tier.features} className={`${styles.tier} ${tier.recommended ? styles.recommendedTier : ""}`}>
            {tier.recommended && <span className={styles.tierTag}>Recommended</span>}
            <h4 className={styles.tierCount}>{tier.features} features</h4>
            <p className={styles.tierPrice}>{tier.price}</p>
            <p className={styles.tierEach}>{tier.perFeature} per feature</p>
            <ul className={styles.tierDetails}>
              <li>{tier.schedule}</li>
              {tier.instagram && <li>Instagram exposure</li>}
            </ul>
          </li>
        ))}
      </ul>
      <p className={styles.tierNote}>Four issues in a row is the run we&apos;ve seen perform best.</p>
    </div>
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
          <li><strong><small>Nearly</small> 60%</strong><span>open rates</span></li>
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
          id="presenting-partner"
          title="Presenting Partner"
          tiers={<PresentingPartnerTiers />}
          lead="The biggest presence we offer."
          includesHeading="Every feature includes:"
          includes={["Your logo at the top of the issue", "Your sponsor message right after the morning note", "Custom-written or edited copy", "Photo or logo and direct links to your business", "Category exclusivity: no direct competitor in the same issue", "Campaign performance recap"]}
          cta="Ask about a partnership"
          dark
        >
          <p>
            Every feature puts your logo at the top of the issue and your message
            right after the morning note, the first thing readers see when they
            open the Flyer.
          </p>
          <PresentingPartnerExample />
          <p>
            There&apos;s one Presenting Partner spot per issue, about 8 a month.{" "}
            <strong>When they&apos;re booked, they&apos;re booked.</strong>
          </p>
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
          <SectionPartnerExample />
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
          id="featured-event"
          title="Featured Event"
          price="$50"
          frequency="one-time"
          lead="Have something happening that Fayette County should know about?"
          includes={["Your event graphic", "Top spot in WHAT'S HAPPENIN'", "Link to your event details", "One issue ahead of your event"]}
          cta="Tell us about your event"
        >
          <p>
            This option is designed for grand openings, community events, open
            houses, special promotions, anniversary celebrations, fundraisers,
            and other time-sensitive happenings.
          </p>
          <p>
            Your event goes first in WHAT&apos;S HAPPENIN&apos;, the Flyer&apos;s
            local events section, with your event graphic, in an issue ahead of
            your event.
          </p>
          <p>No monthly commitment required.</p>
        </AdvertisingOption>
      </section>

      <section id="local-business-guide" aria-labelledby="local-business-guide-title" className={styles.guide}>
        <div className={`${styles.container} ${styles.guideGrid}`}>
          <div className={styles.guideCopy}>
            <p className={styles.eyebrow}>Local Business Guide</p>
            <h2 id="local-business-guide-title">Get your business in the Local Business Guide</h2>
            <p>
              The Guide is Fayette County&apos;s directory of local businesses,
              kept current by the people who write the Flyer.
            </p>
            <p>
              Guide membership is separate from newsletter advertising and
              doesn&apos;t include placement in the Flyer itself.
            </p>
            <p>
              Not ready for a featured profile? Every Fayette County business can{" "}
              <Link href="/directory/submit">claim a free listing</Link>.
            </p>
          </div>
          <div className={styles.guideCard}>
            <h3>Featured member</h3>
            <p className={styles.guidePrice}>
              <span>$29</span><span className={styles.frequency}>/month</span>
            </p>
            <p className={styles.guideAnnual}>or $288 a year (save $60)</p>
            <div className={styles.inclusions}>
              <h4>Includes:</h4>
              <IncludesList items={["Full profile with photos and description", "Top placement in your category", "A Flyer Perk offer for readers", "Monthly report of views, calls and clicks"]} />
              <Link className={styles.button} href="/directory/join">Become a featured member<Arrow /></Link>
            </div>
          </div>
        </div>
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
