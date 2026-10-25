"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { FormField, inputClass } from "@/components/directory/FormField";
import { DAY_LABELS, DAY_ORDER } from "@/lib/directory/format";
import type { BusinessPhoto, DayKey, TagKey } from "@/lib/directory/types";
import type { ListingContent } from "@/lib/guide/content";
import { saveListing, type EditState } from "../actions";

type DayMode = "" | "open" | "closed";

interface EditListingFormProps {
  listingId: string;
  content: ListingContent;
  towns: string[];
  tags: { key: TagKey; label: string }[];
  maxPhotos: number;
}

export function EditListingForm({ listingId, content, towns, tags, maxPhotos }: EditListingFormProps) {
  const [state, action, pending] = useActionState<EditState, FormData>(saveListing.bind(null, listingId), {});
  const e = state.errors ?? {};
  const describe = (id: string) => ({ "aria-describedby": `${id}-help`, "aria-invalid": e[id] ? true : undefined });

  const [modes, setModes] = useState<Record<DayKey, DayMode>>(() =>
    Object.fromEntries(
      DAY_ORDER.map((d) => [d, content.hours?.[d] === undefined ? "" : content.hours[d]!.length ? "open" : "closed"])
    ) as Record<DayKey, DayMode>
  );

  const [photos, setPhotos] = useState<BusinessPhoto[]>(content.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("listingId", listingId);
      body.set("file", file);
      const response = await fetch("/api/directory/photos", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Upload failed. Try a smaller JPG or PNG.");
      setPhotos((current) => [...current, { src: data.url!, alt: "" }].slice(0, maxPhotos));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const perk = content.perk;

  return (
    <form action={action} className="grid gap-10" noValidate>
      <div aria-live="polite">
        {state.message && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[15px] text-red-800">
            {state.message}
          </p>
        )}
        {state.saved && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] text-emerald-900">
            Saved. If your listing is live, changes show on the site within a few minutes.
          </p>
        )}
      </div>

      <fieldset className="grid gap-5">
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">The basics</legend>
        <FormField id="name" label="Business name" error={e.name}>
          <input id="name" name="name" defaultValue={content.name} required maxLength={80} className={inputClass} {...describe("name")} />
        </FormField>
        <FormField id="tagline" label="One-line summary" optional hint="Shown in italics under your name, e.g. “Family chiropractic with Saturday hours.”">
          <input id="tagline" name="tagline" defaultValue={content.tagline} maxLength={140} className={inputClass} aria-describedby="tagline-help" />
        </FormField>
        <FormField
          id="description"
          label="About your business"
          optional
          error={e.description}
          hint="Two or three short paragraphs. Leave a blank line between paragraphs."
        >
          <textarea
            id="description"
            name="description"
            defaultValue={content.description?.join("\n\n")}
            rows={8}
            maxLength={3000}
            className={inputClass}
            {...describe("description")}
          />
        </FormField>
        <FormField id="services" label="Services" optional error={e.services} hint="One per line, up to 12.">
          <textarea id="services" name="services" defaultValue={content.services?.join("\n")} rows={5} maxLength={1200} className={inputClass} {...describe("services")} />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Contact and location</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="phone" label="Phone" optional error={e.phone}>
            <input id="phone" name="phone" type="tel" defaultValue={content.phone} maxLength={30} className={inputClass} {...describe("phone")} />
          </FormField>
          <FormField id="website" label="Website" optional error={e.website}>
            <input id="website" name="website" defaultValue={content.website} maxLength={200} placeholder="example.com" className={inputClass} {...describe("website")} />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <FormField id="street" label="Street address" error={e.street}>
            <input id="street" name="street" defaultValue={content.address.street} required maxLength={120} className={inputClass} {...describe("street")} />
          </FormField>
          <FormField id="suite" label="Suite" optional>
            <input id="suite" name="suite" defaultValue={content.address.suite} maxLength={40} className={inputClass} aria-describedby="suite-help" />
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="town" label="Town" error={e.town}>
            <select id="town" name="town" defaultValue={content.town} className={inputClass} {...describe("town")}>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="zip" label="ZIP code" error={e.zip}>
            <input id="zip" name="zip" defaultValue={content.address.zip} inputMode="numeric" maxLength={5} className={inputClass} {...describe("zip")} />
          </FormField>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Hours</legend>
        <p className="mb-4 text-[15px] text-slate/80">Days left as “Not shown” are left off your page.</p>
        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/[0.12] bg-white">
          {DAY_ORDER.map((day) => {
            const interval = content.hours?.[day]?.[0];
            const error = e[`hours.${day}`];
            return (
              <div key={day} className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[7rem_10rem_1fr]">
                <label htmlFor={`mode-${day}`} className="font-medium text-navy">
                  {DAY_LABELS[day].long}
                </label>
                <select
                  id={`mode-${day}`}
                  name={`hours.${day}.mode`}
                  value={modes[day]}
                  onChange={(ev) => setModes((m) => ({ ...m, [day]: ev.target.value as DayMode }))}
                  className={`${inputClass} !mt-0`}
                >
                  <option value="">Not shown</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <div className="flex flex-wrap items-center gap-2">
                  {modes[day] === "open" && (
                    <>
                      <label className="sr-only" htmlFor={`opens-${day}`}>
                        {DAY_LABELS[day].long} opening time
                      </label>
                      <input id={`opens-${day}`} type="time" name={`hours.${day}.opens`} defaultValue={interval?.opens ?? "09:00"} className={`${inputClass} !mt-0 w-auto`} />
                      <span aria-hidden="true" className="text-slate/70">
                        to
                      </span>
                      <label className="sr-only" htmlFor={`closes-${day}`}>
                        {DAY_LABELS[day].long} closing time
                      </label>
                      <input id={`closes-${day}`} type="time" name={`hours.${day}.closes`} defaultValue={interval?.closes ?? "17:00"} className={`${inputClass} !mt-0 w-auto`} />
                    </>
                  )}
                  {error && <span className="text-[13px] font-medium text-red-700">{error}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Photos</legend>
        <p className="mb-4 text-[15px] text-slate/80">
          Up to {maxPhotos} photos (JPG, PNG or WebP, under 4 MB). The first one leads your page.
        </p>
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        {photos.length > 0 && (
          <ul className="mb-4 grid gap-4 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <li key={photo.src} className="overflow-hidden rounded-xl border border-navy/[0.12] bg-white">
                <div className="relative aspect-[4/3] bg-navy/[0.06]">
                  <Image src={photo.src} alt={photo.alt || "Uploaded photo"} fill sizes="240px" className="object-cover" />
                </div>
                <div className="grid gap-2 p-3">
                  <label htmlFor={`photo-alt-${index}`} className="text-[13px] font-semibold text-navy">
                    Describe this photo
                  </label>
                  <input
                    id={`photo-alt-${index}`}
                    value={photo.alt}
                    maxLength={140}
                    onChange={(ev) => setPhotos((list) => list.map((p, i) => (i === index ? { ...p, alt: ev.target.value } : p)))}
                    placeholder="e.g. Our front entrance on Hwy 54"
                    className={`${inputClass} !mt-0 text-sm`}
                  />
                  <div className="flex gap-3 text-[13px]">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => setPhotos((list) => [list[index], ...list.filter((_, i) => i !== index)])}
                        className="font-medium text-navy underline underline-offset-4"
                      >
                        Make first
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPhotos((list) => list.filter((_, i) => i !== index))}
                      className="font-medium text-red-700 underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {photos.length < maxPhotos && (
          <div>
            <label htmlFor="photo-upload" className="btn-secondary inline-flex min-h-11 cursor-pointer items-center">
              {uploading ? "Uploading…" : "Add a photo"}
            </label>
            <input
              id="photo-upload"
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                if (file) void upload(file);
              }}
              className="sr-only"
            />
          </div>
        )}
        {(uploadError || e.photos) && <p className="mt-2 text-[13px] font-medium text-red-700">{uploadError ?? e.photos}</p>}
        <p className="mt-2 text-[13px] text-slate/75">Photos are saved when you click Save changes.</p>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Details</legend>
        <p className="mb-3 text-[15px] text-slate/80">Readers can filter by these.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {tags.map((tag) => (
            <label key={tag.key} className="flex min-h-10 cursor-pointer items-center gap-3 text-[15px]">
              <input type="checkbox" name="tags" value={tag.key} defaultChecked={content.tags?.includes(tag.key)} className="h-[18px] w-[18px] accent-navy" />
              {tag.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-1 font-serif text-2xl font-semibold text-navy">Flyer Perk</legend>
        <p className="-mt-3 text-[15px] text-slate/80">A deal for Flyer readers. Perks are featured on the guide&apos;s home page.</p>
        <FormField id="perk.title" label="Perk headline" optional error={e["perk.title"]} hint="e.g. “Free first consultation” or “$25 off a service call”">
          <input id="perk.title" name="perk.title" defaultValue={perk?.title} maxLength={80} className={inputClass} {...describe("perk.title")} />
        </FormField>
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <FormField id="perk.details" label="Fine print" optional>
            <input id="perk.details" name="perk.details" defaultValue={perk?.details} maxLength={200} className={inputClass} aria-describedby="perk.details-help" />
          </FormField>
          <FormField id="perk.code" label="Code" optional>
            <input id="perk.code" name="perk.code" defaultValue={perk?.code} maxLength={20} className={`${inputClass} uppercase`} aria-describedby="perk.code-help" />
          </FormField>
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 border-t border-navy/10 bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-5">
        <button type="submit" disabled={pending || uploading} className="btn-primary min-h-12 disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
