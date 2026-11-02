import Link from "next/link";
import { PlaneIcon } from "@/components/PlaneIcon";
import { CheckIcon, PhoneIcon } from "@/components/directory/icons";

/** What the owner just submitted, used to show their own business as a featured listing. */
export interface UpgradePreview {
  name: string;
  categoryHeading: string;
  city: string;
  street: string;
  phone?: string;
  /** Featured signup link, pre-filled with these details. */
  href: string;
}

export interface UpgradePricing {
  monthly: number;
  yearly: number;
  /** e.g. "about 79¢ a day" */
  perDay: string;
}

/**
 * Offered after a free listing is submitted: the small step is done, so this
 * is a clearly optional next step, shown with the owner's own business.
 */
export function UpgradeOffer({ preview, pricing }: { preview: UpgradePreview; pricing: UpgradePricing }) {
  const category = preview.categoryHeading.toLowerCase();
  const perks = [
    `Listed first in ${category}, above free listings`,
    "Photos and a full description",
    "A Flyer Perk offer for readers",
    "Monthly report of views, calls and clicks",
    "Edit your listing yourself, anytime",
  ];

  return (
    <section aria-labelledby="upgrade-heading" className="mt-10 border-t-[3px] border-navy pt-7 [border-top-style:double]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-ink">Optional upgrade</span>
      <h3 id="upgrade-heading" className="mt-2.5 font-serif text-[28px] font-semibold leading-tight text-navy sm:text-[32px]">
        Want {preview.name} to stand out?
      </h3>
      <p className="mt-2 max-w-[58ch] leading-7 text-slate">
        Here&apos;s how your business would look in the guide&apos;s {category} page, free and featured.
      </p>

      <div className="mt-6 grid items-start gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <figure>
          <figcaption className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate/70">Your free listing</figcaption>
          <div className="rounded-2xl border border-navy/[0.12] bg-paper px-5 py-4">
            <p className="font-serif text-xl font-semibold text-navy">{preview.name}</p>
            <p className="mt-0.5 text-sm text-slate/80">
              {preview.city} · {preview.street}
              {preview.phone ? ` · ${preview.phone}` : ""}
            </p>
          </div>
        </figure>

        <figure>
          <figcaption className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-ink">As a featured member</figcaption>
          <div className="overflow-hidden rounded-2xl border border-navy/[0.12] bg-white shadow-[0_24px_48px_-30px_rgba(21,22,57,0.55)]">
            <div className="flex h-28 items-center justify-center gap-2.5 bg-[linear-gradient(135deg,#24275e,#151639)] text-sm text-white/70">
              <PlaneIcon className="h-6 w-6 rotate-45 text-gold" />
              Your photos here
            </div>
            <div className="px-5 py-4">
              <span className="sponsor-label">Featured member</span>
              <p className="mt-2 font-serif text-[22px] font-semibold leading-tight text-navy">{preview.name}</p>
              <p className="mt-0.5 text-sm text-slate/80">
                {preview.city} · {preview.street}
              </p>
              <p className="mt-2.5 text-[15px] italic leading-6 text-slate/80">
                Your description: tell neighbors what makes {preview.name} worth a visit.
              </p>
              <p className="mt-3">
                <span className="rounded-md border border-dashed border-gold px-2.5 py-1 text-xs font-medium text-navy">
                  Flyer Perk: your offer for readers
                </span>
              </p>
              {preview.phone && (
                <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
                  <PhoneIcon className="h-4 w-4" />
                  Call {preview.phone}
                </p>
              )}
            </div>
          </div>
        </figure>
      </div>

      <div className="mt-7 rounded-2xl bg-navy p-6 text-white sm:p-7">
        <p className="font-serif text-[30px] font-semibold leading-tight !text-white">
          {pricing.perDay.charAt(0).toUpperCase() + pricing.perDay.slice(1)}
        </p>
        <p className="mt-1 text-[15px] text-white/80">
          ${pricing.yearly} a year, or ${pricing.monthly} a month and cancel anytime.
        </p>
        <ul className="mt-5 grid gap-2.5 text-[15px] sm:grid-cols-2">
          {perks.map((perk) => (
            <li key={perk} className="flex gap-2.5">
              <CheckIcon className="mt-[3px] h-4 w-4 shrink-0 text-gold" />
              {perk}
            </li>
          ))}
        </ul>
        <Link
          href={preview.href}
          className="mt-6 flex min-h-12 items-center justify-center rounded-md bg-gold px-6 py-3 text-center font-semibold !text-navy-dark transition hover:bg-[#bba36d] hover:!no-underline sm:inline-flex sm:px-8"
        >
          Upgrade to featured
        </Link>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Your business details carry over, so you&apos;ll just add your email and choose a plan. If you upgrade, your featured listing takes the place of the free one.
        </p>
      </div>

      <p className="mt-5 text-[15px] text-slate">
        Happy with free? You&apos;re all set.{" "}
        <Link href="/directory" className="font-medium">
          Back to the guide
        </Link>
      </p>
    </section>
  );
}
