import Link from "next/link";
import { CheckIcon } from "@/components/directory/icons";
import { CATEGORY_GROUPS, DIRECTORY_PATH, GUIDE_NAME, PRICING, categoriesInGroup } from "@/lib/directory";
import { guideMetadata } from "@/lib/directory/metadata";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { JoinForm } from "./JoinForm";

export const metadata = guideMetadata({
  title: `Become a Featured Member | ${GUIDE_NAME} | ${SITE_CONFIG.name}`,
  description: `Put your Fayette County business in front of Fayette Flyer readers: a full profile with photos, top placement in your category and a newsletter spotlight, for $${PRICING.monthly} a month.`,
  path: "/directory/join",
});

const INCLUDED = [
  "A full profile with photos, hours and a description",
  "Top placement in your category",
  "A Flyer Perk offer shown to readers",
  "A spotlight in the Flyer newsletter",
  "A monthly report of views, calls and clicks",
  "Edit your listing yourself, anytime",
];

interface Props {
  searchParams: Promise<{ plan?: string; canceled?: string }>;
}

export default async function JoinPage({ searchParams }: Props) {
  const { plan, canceled } = await searchParams;
  const categoryGroups = CATEGORY_GROUPS.map((group) => ({
    name: group.name,
    options: categoriesInGroup(group.slug).map((c) => ({ value: c.slug, label: c.heading })),
  }));

  return (
    <main className="flex-1 bg-paper">
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-[13px] text-slate/80">
          <Link href={DIRECTORY_PATH}>{GUIDE_NAME}</Link>
          <span aria-hidden="true" className="mx-2 text-gold">›</span>
          <span aria-current="page">Become a featured member</span>
        </nav>
        <div className="mt-10 border-t-[3px] border-navy pt-7 [border-top-style:double]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">For business owners</span>
          <h1 className="mt-3 max-w-[18ch] font-serif text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[1.02] text-navy">
            Become a featured member
          </h1>
          <p className="mt-4 max-w-[640px] font-serif text-[21px] italic leading-8 text-slate">
            Put your business in front of the neighbors who read the Flyer every week.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-12 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-[999_1_560px]">
          {canceled && (
            <p className="mb-6 rounded-xl border border-navy/15 bg-white px-4 py-3 text-[15px] text-slate">
              Checkout was canceled and you weren&apos;t charged. Your details are below if you&apos;d like to try again.
            </p>
          )}
          <JoinForm
            categoryGroups={categoryGroups}
            towns={[...SITE_CONFIG.cities]}
            defaultPlan={plan === "yearly" ? "yearly" : "monthly"}
            pricing={{ monthly: PRICING.monthly, yearly: PRICING.yearly, savings: PRICING.yearlySavings }}
          />
        </div>

        <aside className="min-w-0 flex-[1_1_300px] max-lg:order-first lg:sticky lg:top-8">
          <div className="rounded-[18px] bg-navy p-7 text-white shadow-[0_30px_60px_-32px_rgba(21,22,57,0.6)]">
            <h2 className="font-serif text-2xl font-semibold !text-white">Featured member</h2>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
              <span className="font-serif text-4xl font-semibold">${PRICING.monthly}</span>
              <span className="text-white/80">a month</span>
            </p>
            <p className="text-sm text-gold">
              or ${PRICING.yearly} a year (save ${PRICING.yearlySavings})
            </p>
            <ul className="mt-5 grid gap-2.5 text-[15px]">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 px-1 text-sm leading-6 text-slate/80">
            Just want a basic listing? It&apos;s free:{" "}
            <Link href="/directory/submit" className="font-medium">
              see the free option
            </Link>
            . Already a member?{" "}
            <Link href="/directory/manage" className="font-medium">
              Sign in
            </Link>
            .
          </p>
        </aside>
      </div>
    </main>
  );
}
