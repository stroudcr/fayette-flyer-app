import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components";
import { PlaneIcon } from "@/components/PlaneIcon";
import { DirectorySearch, type SearchEntry } from "@/components/directory/DirectorySearch";
import { CheckIcon } from "@/components/directory/icons";
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  DIRECTORY_PATH,
  FREE_LISTING_MAILTO,
  GUIDE_NAME,
  PRICING,
  businessHref,
  capitalize,
  categoriesInGroup,
  categoryHref,
  formatShortDate,
  getCategory,
  getGroup,
  guideEdition,
  recentlyAdded,
  townCode,
} from "@/lib/directory";
import { getGuideBusinesses } from "@/lib/directory/data";
import { guideMetadata } from "@/lib/directory/metadata";
import { generateGuideSchema } from "@/lib/directory/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

// Paid listings change through the database; pages also refresh on demand when they do.
export const revalidate = 300;

export const metadata = guideMetadata({
  title: `${GUIDE_NAME} | Fayette County, GA Businesses | ${SITE_CONFIG.name}`,
  description:
    "Find local businesses in Fayette County, GA: Peachtree City, Fayetteville, Tyrone, Brooks and Woolsey. Health care, home services, restaurants, golf cart shops and more, from the Fayette Flyer.",
  path: DIRECTORY_PATH,
});

const FREE_FEATURES = ["Name, address, phone and hours", "Listed in your category", "Link to your website"];
const FEATURED_FEATURES = [
  "Everything in the free listing",
  "Full profile with photos and description",
  "Top placement in your category",
  "A Flyer Perk offer for readers",
  "Spotlight in the Flyer newsletter",
  "Monthly report of views, calls and clicks",
];

function SectionEyebrow({ number, label, inverse = false }: { number: number; label: string; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`font-mono text-[13px] font-semibold ${inverse ? "text-gold" : "text-gold-ink"}`}>
        {String(number).padStart(2, "0")}
      </span>
      <span className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${inverse ? "text-gold" : "text-gold-ink"}`}>
        {label}
      </span>
    </div>
  );
}

export default async function DirectoryHomePage() {
  const businesses = await getGuideBusinesses();
  const counts = new Map<string, number>();
  for (const b of businesses) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);

  const featured = businesses.filter((b) => b.tier === "featured").slice(0, 3);
  const perks = businesses.filter((b) => b.perk).slice(0, 4);
  const recent = recentlyAdded(businesses, 5);
  const popular = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug]) => getCategory(slug))
    .filter((c) => c !== undefined);

  const searchEntries: SearchEntry[] = [
    ...CATEGORIES.map((c) => ({
      label: c.heading,
      href: categoryHref(c.slug),
      meta: `Category · ${getGroup(c.group)?.name ?? ""}`,
      terms: [c.name, c.singular, c.blurb, ...(c.keywords ?? [])].join(" "),
    })),
    ...businesses.map((b) => {
      const category = getCategory(b.category);
      return {
        label: b.name,
        href: businessHref(b),
        meta: `${capitalize(category?.singular ?? "")} · ${b.town}`,
        terms: [category?.name, category?.singular, ...(category?.keywords ?? []), b.town].join(" "),
      };
    }),
  ];

  let section = 1;

  return (
    <main className="flex-1 bg-paper">
      <JsonLd data={generateGuideSchema(CATEGORIES)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: SITE_CONFIG.url },
          { name: GUIDE_NAME, url: `${SITE_CONFIG.url}${DIRECTORY_PATH}` },
        ])}
      />

      {/* ---------- Masthead ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-2 border-b border-t-[3px] border-b-navy/25 border-t-navy py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-navy [border-top-style:double]">
          <span>{guideEdition()} edition</span>
          <span className="text-gold-ink">{SITE_CONFIG.cities.join(" · ")}</span>
          <span>{businesses.length === 0 ? "Now accepting listings" : "Free to browse"}</span>
        </div>

        <div className="pt-14 text-center">
          <p className="font-display text-xl font-black uppercase tracking-[0.1em] text-navy">The Fayette Flyer</p>
          <h1 className="mt-2.5 font-serif text-[clamp(3rem,8.4vw,7rem)] font-semibold leading-[0.92] tracking-[-0.01em] text-navy">
            <span className="font-display font-normal italic">Local</span> Business Guide
          </h1>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3.5" aria-hidden="true">
            <span className="h-px w-[60px] bg-gold" />
            <PlaneIcon className="h-4 w-4 rotate-90 text-gold" />
            <span className="h-px w-[60px] bg-gold" />
          </div>
          <p className="mx-auto mt-5 max-w-[620px] font-serif text-[22px] italic leading-[34px] text-slate">
            Every business worth knowing in Fayette County, kept current by the people who write your newsletter.
          </p>

          <DirectorySearch entries={searchEntries} />

          {popular.length > 0 && (
            <p className="mt-[18px] text-sm text-slate/80">
              Popular:{" "}
              {popular.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && " · "}
                  <Link href={categoryHref(c.slug)} className="font-medium">
                    {c.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      {/* ---------- The index ---------- */}
      <section className="border-t border-navy/[0.12] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-[72px] sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionEyebrow number={section++} label="The index" />
            <h2 className="mt-2.5 font-serif text-4xl font-semibold text-navy sm:text-[40px]">Browse by category</h2>
          </div>

          <div className="grid gap-x-14 gap-y-11 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.slug}>
                <h3 className="mb-2.5 border-b-2 border-navy pb-2.5 font-serif text-[22px] font-semibold text-navy">{group.name}</h3>
                <ul>
                  {categoriesInGroup(group.slug).map((category) => {
                    const count = counts.get(category.slug) ?? 0;
                    return (
                      <li key={category.slug}>
                        <Link href={categoryHref(category.slug)} className="group flex items-baseline gap-2 py-[9px] hover:!no-underline">
                          <span className="group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">{category.name}</span>
                          <span aria-hidden="true" className="flex-1 border-b border-dotted border-navy/35" />
                          {count > 0 ? (
                            <span className="font-mono text-[13px] text-slate/80">
                              {count}
                              <span className="sr-only"> listings</span>
                            </span>
                          ) : (
                            <span aria-hidden="true" className="font-mono text-[13px] text-gold">→</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Flyer picks ---------- */}
      {featured.length > 0 && (
        <section className="border-t border-navy/[0.12]">
          <div className="mx-auto max-w-6xl px-4 py-[72px] sm:px-6 lg:px-8">
            <SectionEyebrow number={section++} label="Flyer picks" />
            <h2 className="mb-9 mt-2.5 font-serif text-4xl font-semibold text-navy sm:text-[40px]">Featured members</h2>
            <div className="flex flex-wrap gap-6">
              {featured.map((b, i) => {
                const category = getCategory(b.category);
                const lead = i === 0;
                const photo = b.photos?.[0];
                return (
                  <Link
                    key={b.slug}
                    href={businessHref(b)}
                    className={`block min-w-0 overflow-hidden rounded-[18px] border border-navy/10 bg-white transition hover:-translate-y-0.5 hover:border-navy/25 hover:!no-underline hover:shadow-[0_24px_48px_-30px_rgba(21,22,57,0.5)] ${
                      lead ? "flex-[1.4_1_520px]" : "flex-[1_1_340px]"
                    }`}
                  >
                    {lead && (
                      <div className="relative flex aspect-video items-center justify-center bg-[linear-gradient(135deg,#24275e,#151639)]">
                        {photo ? (
                          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                        ) : (
                          <PlaneIcon className="h-12 w-12 rotate-45 text-gold" />
                        )}
                      </div>
                    )}
                    <div className={lead ? "px-8 pb-8 pt-7" : "p-7"}>
                      <span className="sponsor-label">Featured member · {capitalize(category?.singular ?? "")}</span>
                      <h3 className={`mt-3 font-serif font-semibold leading-tight text-navy ${lead ? "text-[32px]" : "text-2xl"}`}>{b.name}</h3>
                      {(b.tagline || b.description?.[0]) && (
                        <p className={`mt-2.5 text-slate ${lead ? "text-[17px] leading-7" : "leading-[26px]"}`}>{b.tagline ?? b.description?.[0]}</p>
                      )}
                      <span className="mt-4 inline-block font-medium text-navy">
                        Read the profile <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Flyer perks ---------- */}
      {perks.length > 0 && (
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-6xl px-4 py-[72px] sm:px-6 lg:px-8">
            <SectionEyebrow number={section++} label="Flyer perks" inverse />
            <h2 className="mb-8 mt-2.5 font-serif text-4xl font-semibold !text-white sm:text-[40px]">Deals for Flyer readers</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((b) => {
                const category = getCategory(b.category);
                return (
                  <li key={b.slug}>
                    <Link
                      href={businessHref(b)}
                      className="block h-full rounded-[14px] border-2 border-dashed border-gold/70 p-[22px] !text-white transition hover:border-gold hover:bg-white/[0.04] hover:!no-underline"
                    >
                      <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                        {category?.name} · {townCode(b.town)}
                      </span>
                      <span className="mt-2.5 block font-serif text-[22px] font-semibold leading-tight">{b.perk?.title}</span>
                      <span className="mt-2 block text-sm text-white/80">{b.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- New in the guide ---------- */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-[72px] sm:px-6 lg:px-8">
          <SectionEyebrow number={section++} label="New in the guide" />
          <h2 className="mb-7 mt-2.5 font-serif text-4xl font-semibold text-navy sm:text-[40px]">Recently added</h2>
          <ul className="border-t border-navy/15">
            {recent.map((b) => {
              const category = getCategory(b.category);
              return (
                <li key={b.slug}>
                  <Link
                    href={businessHref(b)}
                    className="group grid gap-2 border-b border-navy/15 py-[22px] transition hover:bg-white hover:!no-underline sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-8 sm:px-3"
                  >
                    <time dateTime={b.addedAt} className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-gold-ink">
                      {formatShortDate(b.addedAt)}
                    </time>
                    <span>
                      <span className="block font-serif text-[21px] font-semibold text-navy group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                        {b.name}
                      </span>
                      <span className="mt-0.5 block text-[15px] text-slate/80">
                        {capitalize(category?.singular ?? "")} · {b.town}
                      </span>
                    </span>
                    <span aria-hidden="true" className="hidden font-mono text-gold sm:block">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ---------- Pricing ---------- */}
      <section id="get-listed" className="scroll-mt-8 border-t border-navy/[0.12] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">For business owners</span>
            <h2 className="mx-auto mt-3 max-w-[20ch] font-serif text-4xl font-semibold leading-[1.1] text-navy sm:text-[44px]">
              Get your business in the {GUIDE_NAME}
            </h2>
            <p className="mx-auto mt-3.5 max-w-[560px] text-[17px] leading-7 text-slate">
              Every Fayette County business can have a free listing. Featured members get a full profile, top placement and a spot in the newsletter.
            </p>
          </div>

          <div className="mx-auto mt-11 flex max-w-[920px] flex-wrap gap-6">
            <div className="min-w-0 flex-[1_1_340px] rounded-[18px] border border-navy/15 bg-paper p-8">
              <h3 className="font-serif text-2xl font-semibold text-navy">Free listing</h3>
              <p className="mt-2.5 font-serif text-5xl font-semibold text-navy">$0</p>
              <ul className="mt-[22px] grid gap-2.5 text-[15px]">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-navy" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={FREE_LISTING_MAILTO} className="btn-secondary mt-7 flex min-h-12 items-center justify-center">
                Claim your free listing
              </a>
            </div>

            <div className="relative min-w-0 flex-[1_1_340px] rounded-[18px] bg-navy p-8 text-white shadow-[0_30px_60px_-32px_rgba(21,22,57,0.6)]">
              <span className="absolute -top-3 left-8 rounded bg-gold px-3 py-[5px] text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-dark">
                Most popular
              </span>
              <h3 className="font-serif text-2xl font-semibold !text-white">Featured member</h3>
              <p className="mt-2.5 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
                <span className="font-serif text-5xl font-semibold">${PRICING.monthly}</span>
                <span className="text-white/80">a month</span>
                <span className="text-gold">
                  or ${PRICING.yearly} a year (save ${PRICING.yearlySavings})
                </span>
              </p>
              <ul className="mt-[22px] grid gap-2.5 text-[15px]">
                {FEATURED_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/directory/join"
                className="mt-7 flex min-h-12 items-center justify-center rounded-md bg-gold font-semibold !text-navy-dark transition hover:bg-[#bba36d] hover:!no-underline"
              >
                Become a featured member
              </Link>
              <p className="mt-3 text-center text-sm text-white/75">
                Already a member?{" "}
                <Link href="/directory/manage" className="font-medium !text-white underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
