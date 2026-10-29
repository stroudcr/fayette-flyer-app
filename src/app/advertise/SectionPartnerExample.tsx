import Image from "next/image";
import styles from "./advertise.module.css";

// A Section Partner placement on the Dog of the Week header graphic: the
// partner's logo sits beneath the section title, set on a slice of an issue
// the way it reads in the inbox.
export function SectionPartnerExample() {
  return (
    <div className={styles.sectionExample}>
      <div className={styles.sectionSheet}>
        <hr className={styles.issueRule} aria-hidden="true" />
        <Image
          src="/advertise-section-partner-dog-of-the-week.jpg"
          alt="The Dog of the Week section header, presented by your logo"
          width={1584}
          height={672}
          sizes="(max-width: 767px) 90vw, 540px"
        />
        <hr className={styles.issueRule} aria-hidden="true" />
      </div>
    </div>
  );
}
