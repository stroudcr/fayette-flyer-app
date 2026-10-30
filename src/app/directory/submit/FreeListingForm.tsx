"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { FormField, inputClass } from "@/components/directory/FormField";
import { DAY_ORDER, DAY_LABELS } from "@/lib/directory/format";
import { submitFreeListing, type FreeState } from "./actions";

interface Props {
  claim: string;
  defaults: Record<string, string>;
  towns: string[];
  categoryGroups: { name: string; options: { value: string; label: string }[] }[];
}

export function FreeListingForm({ claim, defaults, towns, categoryGroups }: Props) {
  const [state, action, pending] = useActionState<FreeState, FormData>(submitFreeListing, {});
  const v = { ...defaults, ...state.values };
  const e = state.errors ?? {};
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (state.errors || state.message) feedback.current?.focus();
  }, [state]);
  const describe = (id: string) => ({ "aria-describedby": `${id}-help`, "aria-invalid": e[id] ? true : undefined });
  if (state.submitted) return (
    <div role="status" className="py-5">
      <h2 className="font-serif text-3xl font-semibold text-navy">Thanks! Your listing is in review.</h2>
      <p className="mt-3 leading-7 text-slate">We&apos;ll check your business details and email you once we&apos;ve reviewed your submission. Your changes will appear after approval.</p>
      <Link href="/directory" className="btn-primary mt-6 inline-flex min-h-12 items-center !text-white">Back to the guide</Link>
    </div>
  );
  return (
    <form key={state.attempt ?? 0} action={action} className="grid gap-7" noValidate aria-busy={pending}>
      <input type="hidden" name="claim" value={claim} />
      <div className="hidden" aria-hidden="true"><label htmlFor="companyFax">Leave this empty</label><input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" /></div>
      {state.message && <p ref={feedback} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{state.message}</p>}
      {Object.keys(e).length > 0 && <p ref={feedback} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">Please fix the highlighted fields.</p>}
      <fieldset className="grid gap-5">
        <legend className="mb-2 font-serif text-2xl font-semibold text-navy">Business details</legend>
        <FormField id="name" label="Business name" error={e.name}>
          <input id="name" name="name" defaultValue={v.name} required maxLength={80} autoComplete="organization" className={inputClass} {...describe("name")} />
        </FormField>
        <FormField id="category" label="Category" error={e.category} hint="Choose the category that fits your business best.">
          <select id="category" name="category" defaultValue={v.category ?? ""} required className={inputClass} {...describe("category")}>
            <option value="" disabled>
              Choose a category
            </option>
            {categoryGroups.map((group) => (
              <optgroup key={group.name} label={group.name}>
                {group.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <FormField id="street" label="Street address" error={e.street}>
            <input id="street" name="street" defaultValue={v.street} required maxLength={120} autoComplete="address-line1" className={inputClass} {...describe("street")} />
          </FormField>
          <FormField id="suite" label="Suite" optional>
            <input id="suite" name="suite" defaultValue={v.suite} maxLength={40} autoComplete="address-line2" className={inputClass} aria-describedby="suite-help" />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="town" label="Town" error={e.town}>
            <select id="town" name="town" defaultValue={v.town ?? ""} required className={inputClass} {...describe("town")}>
              <option value="" disabled>
                Choose a town
              </option>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="zip" label="ZIP code" error={e.zip}>
            <input id="zip" name="zip" defaultValue={v.zip} required inputMode="numeric" maxLength={5} autoComplete="postal-code" className={inputClass} {...describe("zip")} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="phone" label="Phone" optional error={e.phone}>
            <input id="phone" name="phone" type="tel" defaultValue={v.phone} maxLength={30} autoComplete="tel" className={inputClass} {...describe("phone")} />
          </FormField>
          <FormField id="website" label="Website" optional error={e.website}>
            <input id="website" name="website" defaultValue={v.website} maxLength={200} placeholder="example.com" autoComplete="url" className={inputClass} {...describe("website")} />
          </FormField>
        </div>
      </fieldset>
      <details className="rounded-xl border border-navy/15 p-4" open={Object.keys(e).some((key) => key.startsWith("hours.")) || undefined}>
        <summary className="cursor-pointer font-semibold text-navy">Business hours (optional)</summary>
        <p className="mt-2 text-sm text-slate">Leave unknown hours blank. Choose Closed for days you do not open.</p>
        <div className="mt-4 grid gap-4">
          {DAY_ORDER.map((day) => (
            <div key={day} className="grid gap-2 border-t border-navy/10 pt-3 sm:grid-cols-[1fr_1fr_1fr]">
              <label className="text-sm text-navy">{DAY_LABELS[day].long}<select name={`hours.${day}.mode`} defaultValue={v[`hours.${day}.mode`]} className={inputClass}><option value="">Not specified</option><option value="open">Open</option><option value="closed">Closed</option></select></label>
              <label className="text-sm text-navy">Opens<input type="time" name={`hours.${day}.opens`} defaultValue={v[`hours.${day}.opens`]} className={inputClass} /></label>
              <label className="text-sm text-navy">Closes<input type="time" name={`hours.${day}.closes`} defaultValue={v[`hours.${day}.closes`]} className={inputClass} /></label>
              {e[`hours.${day}`] && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{e[`hours.${day}`]}</p>}
            </div>
          ))}
        </div>
      </details>
      <fieldset className="grid gap-5">
        <legend className="mb-2 font-serif text-2xl font-semibold text-navy">Your contact details</legend>
        <p className="text-sm leading-6 text-slate">These details are for our review and won&apos;t be shown publicly.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="contactName" label="Your name" error={e.contactName}><input id="contactName" name="contactName" defaultValue={v.contactName} autoComplete="name" required maxLength={80} className={inputClass} {...describe("contactName")} /></FormField>
          <FormField id="contactRole" label="Your role at the business" error={e.contactRole}><input id="contactRole" name="contactRole" defaultValue={v.contactRole} autoComplete="organization-title" required maxLength={80} placeholder="Owner, manager, etc." className={inputClass} {...describe("contactRole")} /></FormField>
        </div>
        <FormField id="email" label="Your email" error={e.email} hint="We'll contact you about your submission here."><input id="email" name="email" type="email" defaultValue={v.email} required maxLength={254} autoComplete="email" className={inputClass} {...describe("email")} /></FormField>
        <div>
          <label className="flex items-start gap-3 text-sm leading-6 text-navy"><input type="checkbox" name="authorized" value="yes" defaultChecked={v.authorized === "yes"} required className="mt-1 h-4 w-4 shrink-0 accent-navy" aria-describedby="authorized-help" aria-invalid={e.authorized ? true : undefined} />I own or am authorized to represent this business, and the details above are accurate.</label>
          <p id="authorized-help" className="mt-2 text-sm text-red-700">{e.authorized}</p>
        </div>
      </fieldset>
      <div>
        <button type="submit" disabled={pending} className="btn-primary flex min-h-12 w-full items-center justify-center disabled:opacity-60 sm:w-auto sm:px-8">{pending ? "Submitting…" : "Submit for approval"}</button>
        <p className="mt-3 text-sm text-slate/75">$0. No payment or account needed. Every submission is reviewed.</p>
      </div>
    </form>
  );
}
