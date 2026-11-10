"use client";

import { useActionState } from "react";
import { CategoryField } from "@/components/directory/CategoryField";
import { BusinessLocationFields } from "@/components/directory/BusinessLocationFields";
import { FormField, inputClass } from "@/components/directory/FormField";
import { startCheckout, type JoinState } from "./actions";

interface Option {
  value: string;
  label: string;
}

interface JoinFormProps {
  categoryGroups: { name: string; options: Option[] }[];
  /** Business details carried over from a free listing. */
  initialValues?: Record<string, string>;
  defaultPlan: "monthly" | "yearly";
  pricing: { monthly: number; yearly: number; savings: number };
}

export function JoinForm({ categoryGroups, initialValues, defaultPlan, pricing }: JoinFormProps) {
  const [state, action, pending] = useActionState<JoinState, FormData>(startCheckout, {});
  const v = state.values ?? initialValues ?? {};
  const e = state.errors ?? {};
  const plan = v.plan ?? defaultPlan;

  const describe = (id: string) => ({ "aria-describedby": `${id}-help`, "aria-invalid": e[id] ? true : undefined });

  return (
    <form key={state.attempt ?? 0} action={action} className="grid gap-6" noValidate>
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
        <CategoryField key={`category-${state.attempt ?? 0}`} groups={categoryGroups} values={v} errors={e} />
        <BusinessLocationFields key={`location-${state.attempt ?? 0}`} values={v} errors={e} />
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
