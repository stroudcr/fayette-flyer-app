import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components";
import { BusinessProfile } from "@/components/directory/BusinessProfile";
import {
  DIRECTORY_PATH,
  GUIDE_NAME,
  absoluteUrl,
  businessHref,
  businessesInCategory,
  capitalize,
  categoryHref,
  claimHref,
  getBusiness,
  getCategory,
  isBusinessIndexable,
  updateMailto,
} from "@/lib/directory";
import { getGuideBusinesses, getOwnerManagedSlugs } from "@/lib/directory/data";
import { guideMetadata } from "@/lib/directory/metadata";
import { generateLocalBusinessSchema } from "@/lib/directory/schemas";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";

// New paid listings appear without a redeploy: unknown slugs render on demand.
export const dynamicParams = true;
export const revalidate = 300;

interface Props {
  params: Promise<{ category: string; business: string }>;
}

export async function generateStaticParams() {
  const businesses = await getGuideBusinesses();
  return businesses.map((b) => ({ category: b.category, business: b.slug }));
}

function truncate(text: string, max = 155) {
  return text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, business: businessSlug } = await params;
  const business = getBusiness(await getGuideBusinesses(), categorySlug, businessSlug);
  const category = getCategory(categorySlug);
  if (!business || !category) return {};

  const summary = business.tagline ?? business.description?.[0];
  const photo = business.photos?.[0];

  return guideMetadata({
    title: `${business.name} | ${capitalize(category.singular)} in ${business.town}, GA | ${SITE_CONFIG.name}`,
    description: summary
      ? truncate(summary)
      : `${business.name} is a ${category.singular} in ${business.town}, GA. Address, phone, hours and more in the ${SITE_CONFIG.name} ${GUIDE_NAME}.`,
    path: businessHref(business),
    index: isBusinessIndexable(business),
    image: photo ? { url: absoluteUrl(photo.src), alt: photo.alt } : undefined,
  });
}

export default async function BusinessPage({ params }: Props) {
  const { category: categorySlug, business: businessSlug } = await params;
  const businesses = await getGuideBusinesses();
  const business = getBusiness(businesses, categorySlug, businessSlug);
  const category = getCategory(categorySlug);
  if (!business || !category) notFound();

  const ownerManaged = (await getOwnerManagedSlugs()).has(business.slug);
  const manage = ownerManaged
    ? { href: "/directory/manage", label: "Manage this listing" }
    : business.tier === "featured"
      ? { href: updateMailto(business.name), label: "Update this listing" }
      : { href: claimHref(business.slug), label: "Claim this listing" };
  const others = businessesInCategory(businesses, category.slug)
    .filter((b) => b.slug !== business.slug)
    .slice(0, 3);

  return (
    <main className="flex-1 bg-paper">
      <JsonLd data={generateLocalBusinessSchema(business, category)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: SITE_CONFIG.url },
          { name: GUIDE_NAME, url: `${SITE_CONFIG.url}${DIRECTORY_PATH}` },
          { name: category.heading, url: absoluteUrl(categoryHref(category.slug)) },
          { name: business.name, url: absoluteUrl(businessHref(business)) },
        ])}
      />
      <BusinessProfile business={business} category={category} others={others} manage={manage} />
    </main>
  );
}
