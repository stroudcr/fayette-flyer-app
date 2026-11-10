"use client";

import { useActionState } from "react";
import { BusinessLocationFields } from "@/components/directory/BusinessLocationFields";
import { CategoryField } from "@/components/directory/CategoryField";
import { FormField, inputClass } from "@/components/directory/FormField";
import { CATEGORIES, CATEGORY_GROUPS } from "@/lib/directory/categories";
import type { ListingContent } from "@/lib/guide/content";
import { saveReviewDetails, type ReviewState } from "./actions";

const groups = CATEGORY_GROUPS.map((g) => ({ name: g.name, options: CATEGORIES.filter((c) => c.group === g.slug).map((c) => ({ value: c.slug, label: c.heading })) }));

export function ListingDetailsForm({ id, kind, category, content }: { id: string; kind: "free" | "featured"; category: string; content: ListingContent }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(saveReviewDetails.bind(null, kind, id), {});
  const values = state.values ?? {
    name: content.name, category: category === "other" ? "" : category, businessType: content.businessType ?? "storefront",
    city: content.town, street: content.address.street, suite: content.address.suite ?? "", zip: content.address.zip,
    phone: content.phone ?? "", website: content.website ?? "",
  };
  const errors = state.errors ?? {};
  return (
    <details className="mt-4 rounded-xl border border-navy/15 p-4" open={category === "other" || !!state.errors || undefined}>
      <summary className="cursor-pointer font-semibold text-navy">Edit category and business details</summary>
      <form key={state.attempt ?? 0} action={action} className="mt-4 grid gap-5" noValidate>
        {content.categorySuggestion && <p className="rounded-lg bg-paper p-3 text-sm text-navy"><strong>Category request:</strong> {content.categorySuggestion}</p>}
        {state.message && <p role={state.saved ? "status" : "alert"} className="text-sm font-medium text-navy">{state.message}</p>}
        <FormField id={`${id}-name`} label="Business name" error={errors.name}><input id={`${id}-name`} name="name" defaultValue={values.name} required maxLength={80} className={inputClass} /></FormField>
        <CategoryField idPrefix={`${id}-`} groups={groups} values={values} errors={errors} allowOther={false} />
        <BusinessLocationFields idPrefix={`${id}-`} values={values} errors={errors} />
        <button type="submit" disabled={pending} className="btn-secondary min-h-11 justify-self-start disabled:opacity-60">{pending ? "Saving…" : "Save review details"}</button>
      </form>
    </details>
  );
}
