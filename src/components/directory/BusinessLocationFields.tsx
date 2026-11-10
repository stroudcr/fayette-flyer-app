"use client";

import { useState } from "react";
import { BUSINESS_TYPES } from "@/lib/directory/location";
import { FormField, inputClass } from "./FormField";

export function BusinessLocationFields({ values, errors, idPrefix = "" }: { values: Record<string, string>; errors: Record<string, string>; idPrefix?: string }) {
  const [businessType, setBusinessType] = useState(values.businessType ?? "storefront");
  const storefront = businessType === "storefront";
  const online = businessType === "online-only";
  const describe = (id: string) => ({ "aria-describedby": `${idPrefix}${id}-help`, "aria-invalid": errors[id] ? true : undefined });
  return (
    <>
      <FormField id={`${idPrefix}businessType`} label="How does your business operate?" error={errors.businessType} hint={storefront ? "Your business address will be public, with a map and directions." : "Only your base city will be public. No street address, map or directions."}>
        <select id={`${idPrefix}businessType`} name="businessType" value={businessType} onChange={(event) => setBusinessType(event.target.value)} required className={inputClass} {...describe("businessType")}>
          {BUSINESS_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </FormField>
      {storefront && (
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <FormField id={`${idPrefix}street`} label="Street address" error={errors.street}>
            <input id={`${idPrefix}street`} name="street" defaultValue={values.street} required maxLength={120} autoComplete="address-line1" className={inputClass} {...describe("street")} />
          </FormField>
          <FormField id={`${idPrefix}suite`} label="Suite" optional>
            <input id={`${idPrefix}suite`} name="suite" defaultValue={values.suite} maxLength={40} autoComplete="address-line2" className={inputClass} aria-describedby={`${idPrefix}suite-help`} />
          </FormField>
        </div>
      )}
      <div className={`grid gap-5 ${storefront ? "sm:grid-cols-2" : ""}`}>
        <FormField id={`${idPrefix}city`} label={storefront ? "City" : "Base city"} error={errors.city} hint={storefront ? undefined : "Shown as Based in [city]."}>
          <input id={`${idPrefix}city`} name="city" defaultValue={values.city} required maxLength={40} autoComplete="address-level2" className={inputClass} {...describe("city")} />
        </FormField>
        {storefront && <FormField id={`${idPrefix}zip`} label="ZIP code" error={errors.zip}>
          <input id={`${idPrefix}zip`} name="zip" defaultValue={values.zip} required inputMode="numeric" maxLength={5} autoComplete="postal-code" className={inputClass} {...describe("zip")} />
        </FormField>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={`${idPrefix}phone`} label="Phone" optional error={errors.phone}>
          <input id={`${idPrefix}phone`} name="phone" type="tel" defaultValue={values.phone} maxLength={30} autoComplete="tel" className={inputClass} {...describe("phone")} />
        </FormField>
        <FormField id={`${idPrefix}website`} label={online ? "Website or shop link" : "Website"} optional={!online} error={errors.website}>
          <input id={`${idPrefix}website`} name="website" defaultValue={values.website} required={online} maxLength={200} placeholder="example.com" autoComplete="url" className={inputClass} {...describe("website")} />
        </FormField>
      </div>
    </>
  );
}
