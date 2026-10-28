import Image from "next/image";
import Link from "next/link";
import styles from "./advertise.module.css";

// A real Presenting Partner placement: the top of the July 23, 2026 issue,
// "✈️ A Few Trends", presented by Pillar Heating & Cooling. Copy is taken
// verbatim from that issue and shortened to fit.
const sponsorUrl = "https://callpillar.com/";
const issueHref = "/issues/a-few-trends";
const pillarLogo =
  "https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/18f89696-2962-4e18-806e-dc78a59dd219/Full-logo-Site.png?t=1782441595";
const pillarPhoto =
  "https://beehiiv-images-production.s3.amazonaws.com/uploads/asset/file/352de74e-26e4-48f9-9481-a40388b60a27/636968273_122094840795285070_3747900076117144099_n.jpg?t=1782441755";

export function PresentingPartnerExample() {
  return (
    <figure className={styles.issueExample}>
      <figcaption className={styles.issueCaption}>
        A real example: Pillar Heating &amp; Cooling presenting our July&nbsp;23
        issue, shortened to fit.
      </figcaption>

      <div className={styles.issueSheet}>
        <div>
          <p className={styles.issueMeta}>
            July 23, 2026 <span aria-hidden="true">|</span>{" "}
            <Link href={issueHref}>Read online</Link>
          </p>
          <p className={styles.issueTitle}>
            <span aria-hidden="true">✈️ </span>A Few Trends
          </p>
        </div>

        <div className={`${styles.callout} ${styles.logoCallout}`}>
          <span className={styles.calloutTag}>Your logo, top of the issue</span>
          <a href={sponsorUrl} target="_blank" rel="sponsored noopener noreferrer" className={styles.issueLogo}>
            <Image
              src={pillarLogo}
              alt="Pillar Heating + Cooling"
              width={764}
              height={305}
              sizes="(max-width: 767px) 60vw, 290px"
            />
          </a>
        </div>

        <hr className={styles.issueRule} />

        <div>
          <p>Good morning, <strong>Fayette County.</strong></p>
          <p>
            I&rsquo;ve been putting together the Flyer long enough to start
            noticing a few trends, and lately one stands out: we may be in the
            middle of a cover-band boom.
          </p>
          <p className={styles.issueFade} aria-hidden="true">
            In any given month, you can usually find at least one group paying
            tribute to a familiar artist, decade, or genre.
          </p>
        </div>

        <hr className={styles.issueRule} />

        <div className={styles.callout}>
          <span className={styles.calloutTag}>Your message, right after the morning note</span>
          <p className={styles.issueSection}>Sponsored by Pillar Heating &amp; Cooling</p>
          <a href={sponsorUrl} target="_blank" rel="sponsored noopener noreferrer" className={styles.issuePhoto}>
            <Image
              src={pillarPhoto}
              alt="Pillar Heating + Cooling service van beside the words “We stand strong”"
              width={1708}
              height={750}
              sizes="(max-width: 767px) 85vw, 560px"
            />
          </a>
          <p>Comfort should be one of the easiest parts of coming home.</p>
          <p>
            Pillar Heating &amp; Cooling helps Fayette County homeowners keep it
            that way with dependable heating, cooling, mini split and indoor air
            quality service built around honest recommendations and long-term
            reliability.
          </p>
          <p>
            Call Pillar Heating &amp; Cooling at (470) 777-2930 or{" "}
            <a href={sponsorUrl} target="_blank" rel="sponsored noopener noreferrer">book online today</a>.
          </p>
        </div>

        <div className={styles.issueNext} aria-hidden="true">
          <hr className={styles.issueRule} />
          <p className={styles.issueSection}>The Digest</p>
        </div>
      </div>
    </figure>
  );
}
