import Link from "next/link";
import { CheckIcon } from "@/components/directory/icons";
import { FREE_LISTING_HREF, GUIDE_NAME, PRICING } from "@/lib/directory";

const FREE_FEATURES = ["Name, address, phone and hours", "Listed in your category", "Link to your website"];
const FEATURED_FEATURES = [
  "Everything in the free listing",
  "Full profile with photos and description",
  "Top placement in your category",
  "A Flyer Perk offer for readers",
  "Spotlight in the Flyer newsletter",
  "Monthly report of views, calls and clicks",
];

/** "Get your business in the Local Business Guide" pricing block, shown at the bottom of guide pages. */
export function GetListedSection() {
  return (
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
            <a href={FREE_LISTING_HREF} className="btn-secondary mt-7 flex min-h-12 items-center justify-center">
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
  );
}
