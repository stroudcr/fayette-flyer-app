import { SubscribeForm } from "./SubscribeForm";
import { PlaneIcon } from "./PlaneIcon";

/** Signup block styled as a First Class boarding pass. */
export function BoardingPass({ campaign = "events_page" }: { campaign?: string }) {
  return (
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative grid overflow-hidden rounded-2xl bg-navy text-white shadow-[0_30px_60px_-30px_rgba(21,22,57,0.6)] md:grid-cols-[1fr_17rem]">
          <div className="p-7 sm:p-10">
            <div className="flex items-center gap-3">
              <PlaneIcon className="h-4 w-4 rotate-90 text-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold">Boarding pass</span>
            </div>
            <h2 className="mt-4 max-w-md font-serif text-3xl font-semibold leading-tight !text-white sm:text-4xl">
              Your week in Fayette County, delivered.
            </h2>
            <p className="mt-3 max-w-md leading-7 text-white/75">
              Local news, the week’s events, and the meetings that matter, twice a week. No paywall, ever.
            </p>
            <div className="mt-6 max-w-lg">
              <SubscribeForm variant="hero" theme="inverse" showHelperText={false} campaign={campaign} />
            </div>
          </div>

          {/* Stub */}
          <div className="relative border-t border-dashed border-white/25 p-7 font-mono text-xs uppercase tracking-[0.16em] md:border-l md:border-t-0 sm:p-10">
            <span className="absolute -left-3 -top-3 hidden h-6 w-6 rounded-full bg-paper md:block" aria-hidden="true" />
            <span className="absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-paper md:block" aria-hidden="true" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-1">
              <div>
                <dt className="text-white/50">Passenger</dt>
                <dd className="mt-1 text-sm text-white">You</dd>
              </div>
              <div>
                <dt className="text-white/50">Destination</dt>
                <dd className="mt-1 text-sm text-white">Fayette County</dd>
              </div>
              <div>
                <dt className="text-white/50">Departs</dt>
                <dd className="mt-1 text-sm text-white">Mon · Thu</dd>
              </div>
              <div>
                <dt className="text-white/50">Class</dt>
                <dd className="mt-1 text-sm text-gold">First · Free</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
  );
}
