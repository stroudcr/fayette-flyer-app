"use client";

import { useState } from "react";
import { FormField, inputClass } from "./FormField";

export interface CategoryOptionGroup {
  name: string;
  options: { value: string; label: string }[];
}

export function CategoryField({ groups, values, errors, allowOther = true, idPrefix = "" }: {
  groups: CategoryOptionGroup[];
  values: Record<string, string>;
  errors: Record<string, string>;
  allowOther?: boolean;
  idPrefix?: string;
}) {
  const [category, setCategory] = useState(values.category ?? "");
  return (
    <>
      <FormField id={`${idPrefix}category`} label="Category" error={errors.category} hint={allowOther ? "Choose the best fit, or select Other if your category is missing." : "Choose the public category before publishing."}>
        <select id={`${idPrefix}category`} name="category" value={category} onChange={(event) => setCategory(event.target.value)} required className={inputClass} aria-describedby={`${idPrefix}category-help`} aria-invalid={errors.category ? true : undefined}>
          <option value="" disabled>Choose a category</option>
          {groups.map((group) => <optgroup key={group.name} label={group.name}>{group.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>)}
          {allowOther && <option value="other">Other / My category isn&apos;t listed</option>}
        </select>
      </FormField>
      {category === "other" && allowOther && (
        <FormField id={`${idPrefix}categorySuggestion`} label="What does your business offer?" error={errors.categorySuggestion} hint="We'll choose a suitable category during review. This note is for our team.">
          <textarea id={`${idPrefix}categorySuggestion`} name="categorySuggestion" defaultValue={values.categorySuggestion} required maxLength={500} rows={3} className={inputClass} aria-describedby={`${idPrefix}categorySuggestion-help`} aria-invalid={errors.categorySuggestion ? true : undefined} />
        </FormField>
      )}
    </>
  );
}
