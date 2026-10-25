"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/directory/FormField";
import { startCheckout, type JoinState } from "./actions";

interface Option {
  value: string;
  label: string;
}

interface JoinFormProps {
  categoryGroups: { name: string; options: Option[] }[];
  towns: string[];
  defaultPlan: "monthly" | "yearly";
  pricing: { monthly: number; yearly: number; savings: number };
}

export function JoinForm({ categoryGroups, towns, defaultPlan, pricing }: JoinFormProps) {
  const [state, action, pending] = useActionState<JoinState, FormData>(startCheckout, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const plan = v.plan ?? defaultPlan;

  const describe = (id: string) => ({ "aria-describedby": `${id}-help`, "aria-invalid": e[id] ? true : undefined });

  return (
    <form action={action} className="grid gap-6" noValidate>
      {state.message && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
          {state.message}
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
          Please fix the highlighted fields.
        </p>
      )}

      <fieldset className="grid gap-5">
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Your business</legend>
        <FormField id="name" label="Business name" error={e.name}>
          <input id="name" name="name" defaultValue={v.name} required maxLength={80} autoComplete="organization" className={inputClass} {...describe("name")} />
        </FormField>
        <FormField id="category" label="Category" error={e.category} hint="Don't see yours? Pick the closest and tell us; we add categories often.">
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

      <fieldset className="grid gap-5">
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Your account</legend>
        <FormField id="email" label="Your email" error={e.email} hint="You'll sign in with this to edit your listing and manage billing.">
          <input id="email" name="email" type="email" defaultValue={v.email} required maxLength={254} autoComplete="email" className={inputClass} {...describe("email")} />
        </FormField>

        <div role="radiogroup" aria-labelledby="plan-label" aria-describedby="plan-help">
          <p id="plan-label" className="text-sm font-semibold text-navy">
            Plan
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer gap-3 rounded-xl border border-navy/20 bg-white p-4 transition has-[:checked]:border-navy has-[:checked]:ring-2 has-[:checked]:ring-gold/40">
              <input type="radio" name="plan" value="monthly" defaultChecked={plan === "monthly"} className="mt-1 h-4 w-4 accent-navy" />
              <span>
                <span className="block font-semibold text-navy">${pricing.monthly} a month</span>
                <span className="block text-sm text-slate/80">Cancel anytime</span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-navy/20 bg-white p-4 transition has-[:checked]:border-navy has-[:checked]:ring-2 has-[:checked]:ring-gold/40">
              <input type="radio" name="plan" value="yearly" defaultChecked={plan === "yearly"} className="mt-1 h-4 w-4 accent-navy" />
              <span>
                <span className="block font-semibold text-navy">${pricing.yearly} a year</span>
                <span className="block text-sm text-gold-ink">Save ${pricing.savings}</span>
              </span>
            </label>
          </div>
          <p id="plan-help" className={`mt-1.5 text-[13px] ${e.plan ? "font-medium text-red-700" : "text-slate/75"}`}>
            {e.plan ?? "You can switch plans later from your account."}
          </p>
        </div>
      </fieldset>

      <div>
        <button type="submit" disabled={pending} className="btn-primary flex min-h-12 w-full items-center justify-center text-base disabled:opacity-60 sm:w-auto sm:px-8">
          {pending ? "Opening secure checkout…" : "Continue to secure checkout"}
        </button>
        <p className="mt-3 text-[13px] leading-5 text-slate/75">
          Payment is handled by Stripe. After checkout you&apos;ll add photos, hours and a description, and we&apos;ll review your listing, usually within one business day.
        </p>
      </div>
    </form>
  );
}
