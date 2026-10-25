import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, SubscribeForm } from "@/components";
import { CategoryBrowser, type ListingCard } from "@/components/directory/CategoryBrowser";
import {
  CATEGORIES,
  DIRECTORY_PATH,
  FREE_LISTING_MAILTO,
  GUIDE_NAME,
  PRICING,
  businessHref,
  businessesInCategory,
  capitalize,
  categoriesInGroup,
  categoryHref,
  claimMailto,
  formatMonthYear,
  getCategory,
  getGroup,
  isCategoryIndexable,
  lastUpdated,
  recommendMailto,
  streetLine,
  telHref,
} from "@/lib/directory";
import { guideMetadata } from "@/lib/directory/metadata";
import { generateCategorySchema } from "@/lib/directory/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

export const dynamicParams = false;

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return guideMetadata({
    title: `${category.heading} in Peachtree City & Fayette County, GA | ${SITE_CONFIG.name}`,
    description: `Find ${category.heading.toLowerCase()} in Fayette County, GA: ${category.blurb}. Local listings in Peachtree City, Fayetteville, Tyrone, Brooks and Woolsey from the ${SITE_CONFIG.name} ${GUIDE_NAME}.`,
    path: categoryHref(category.slug),
    index: isCategoryIndexable(category.slug),
  });
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const group = getGroup(category.group);
  const businesses = businessesInCategory(category.slug);
  const perkCount = businesses.filter((b) => b.perk).length;
  const updated = lastUpdated(businesses);
  const related = categoriesInGroup(category.group).filter((c) => c.slug !== category.slug);
  const headingLower = category.heading.toLowerCase();

  const listings: ListingCard[] = businesses.map((b) => ({
    slug: b.slug,
    name: b.name,
    href: businessHref(b),
    featured: b.tier === "featured",
    town: b.town,
    street: streetLine(b),
    phone: b.phone,
    tel: b.phone ? telHref(b.phone) : undefined,
    summary: b.tagline ?? b.description?.[0],
    perkTitle: b.perk?.title,
    tags: b.tags ?? [],
    photo: b.photos?.[0],
    claimHref: claimMailto(b.name),
  }));

  const byline =
    businesses.length > 0
      ? [
          plural(businesses.length, "listing"),
          perkCount > 0 ? plural(perkCount, "Flyer Perk") : null,
          updated ? `Updated ${formatMonthYear(updated)}` : null,
          `Kept by the ${SITE_CONFIG.name}`,
        ]
      : ["Now accepting listings", `Kept by the ${SITE_CONFIG.name}`];

  const faqs = [
    ...(category.faqs ?? []),
    {
      question: `How do I get my business listed?`,
      answer: `Email ${SITE_CONFIG.email} with your business name, address, phone and website. A basic listing is free. Featured members ($${PRICING.monthly} a month or $${PRICING.yearly} a year) get a full profile with photos, top placement, a Flyer Perk for readers and a spotlight in the newsletter.`,
    },
  ];

  return (
    <main className="flex-1 bg-paper">
      <JsonLd data={generateCategorySchema(category, businesses)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: SITE_CONFIG.url },
          { name: GUIDE_NAME, url: `${SITE_CONFIG.url}${DIRECTORY_PATH}` },
          { name: category.heading, url: `${SITE_CONFIG.url}${categoryHref(category.slug)}` },
        ])}
      />

      {/* ---------- Editorial head ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-slate/80">
          <Link href={DIRECTORY_PATH}>{GUIDE_NAME}</Link>
          <span aria-hidden="true" className="mx-2 text-gold">›</span>
          <span>{group?.name}</span>
          <span aria-hidden="true" className="mx-2 text-gold">›</span>
          <span aria-current="page">{category.heading}</span>
        </nav>

        <div className="mt-10 border-t-[3px] border-navy pt-7 [border-top-style:double]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">{group?.name}</span>
          <h1 className="mt-3 max-w-[16ch] font-serif text-[clamp(2.6rem,6vw,4.5rem)] font-semibold leading-none text-navy">
            {category.heading} in Fayette County
          </h1>
          <p className="mt-[18px] max-w-[660px] font-serif text-[22px] italic leading-[33px] text-slate">
            A guide to {headingLower} serving Peachtree City, Fayetteville, Tyrone and nearby: {category.blurb}.
          </p>
          <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate/80">
            {byline.filter(Boolean).join(" · ")}
          </p>
        </div>
      </section>

      {/* ---------- Listings + sidebar ---------- */}
      <div className="mx-auto max-w-6xl px-4 pb-[72px] sm:px-6 lg:px-8">
        <CategoryBrowser
          listings={listings}
          listHeading={`All ${headingLower}, A to Z`}
          emptyState={
            <div className="rounded-[18px] border border-navy/[0.12] bg-white p-8 sm:p-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">Now accepting listings</span>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-navy">No {headingLower} are listed yet.</h2>
              <p className="mt-3 max-w-[56ch] text-[17px] leading-7 text-slate">
                The {GUIDE_NAME} is brand new. If your Fayette County business belongs here, your basic listing is free. Know a great one? Tell us and we’ll reach out.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={FREE_LISTING_MAILTO} className="btn-primary inline-flex min-h-12 items-center !text-white">
                  List your business free
                </a>
                <a href={recommendMailto(category.heading)} className="btn-secondary inline-flex min-h-12 items-center">
                  Recommend one
                </a>
              </div>
            </div>
          }
          afterList={
            <div className="mt-14 border-t-[3px] border-navy pt-7 [border-top-style:double]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">The Flyer’s guide</span>
              {category.guide?.length ? (
                <>
                  <h2 className="mt-2.5 font-serif text-[32px] font-semibold text-navy">How to choose {headingLower} here</h2>
                  {category.guide.map((paragraph) => (
                    <p key={paragraph} className="mt-4 max-w-[68ch] font-serif text-[19px] leading-8 text-slate">
                      {paragraph}
                    </p>
                  ))}
                </>
              ) : (
                <h2 className="mt-2.5 font-serif text-[32px] font-semibold text-navy">Questions</h2>
              )}
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="mb-1.5 mt-6 font-serif text-[21px] font-semibold text-navy">{faq.question}</h3>
                  <p className="max-w-[68ch] leading-[27px] text-slate">{faq.answer}</p>
                </div>
              ))}
            </div>
          }
          sidebar={
            <>
              <SubscribeForm variant="card" campaign={`directory_${category.slug}`} className="!rounded-2xl !border-navy/[0.12]" />

              <div className="rounded-2xl border border-dashed border-navy/30 px-6 py-[22px]">
                <p className="font-serif text-[19px] font-semibold text-navy">Is your business missing?</p>
                <p className="mt-1.5 text-sm leading-[22px] text-slate">
                  Claim your free listing, or become a featured member for ${PRICING.monthly} a month.
                </p>
                <Link href={`${DIRECTORY_PATH}#get-listed`} className="mt-3 inline-block text-[15px] font-medium">
                  Get listed <span aria-hidden="true">→</span>
                </Link>
              </div>

              {related.length > 0 && (
                <nav aria-label="Related categories" className="px-1">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">Related</p>
                  <ul className="grid gap-1.5 text-[15px]">
                    {related.map((c) => (
                      <li key={c.slug}>
                        <Link href={categoryHref(c.slug)}>{capitalize(c.name)}</Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          }
        />
      </div>
    </main>
  );
}
