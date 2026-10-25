"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./icons";

export interface SearchEntry {
  label: string;
  href: string;
  /** Small line under the label, e.g. "Category · Home Services". */
  meta: string;
  /** Lowercase text the query is matched against. */
  terms: string;
}

const MAX_RESULTS = 8;

function normalize(text: string) {
  return text.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
}

/** Instant search over the guide's categories and businesses. */
export function DirectorySearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const inputId = useId();
  const resultsId = useId();
  const [query, setQuery] = useState("");
  const [submittedEmpty, setSubmittedEmpty] = useState(false);

  const q = normalize(query);
  const results = useMemo(() => {
    if (!q) return [];
    const words = q.split(" ");
    return entries
      .filter((entry) => {
        const haystack = normalize(`${entry.label} ${entry.terms}`);
        return words.every((word) => haystack.includes(word));
      })
      .slice(0, MAX_RESULTS);
  }, [entries, q]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (results[0]) {
      router.push(results[0].href);
    } else {
      setSubmittedEmpty(true);
    }
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative mx-auto mt-9 max-w-[720px] text-left">
      <label htmlFor={inputId} className="sr-only">
        Search the Local Business Guide
      </label>
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex min-w-0 flex-[1_1_22rem] items-center gap-3 border-b-2 border-navy px-1">
          <SearchIcon className="h-[22px] w-[22px] shrink-0 text-navy" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSubmittedEmpty(false);
            }}
            placeholder="What are you looking for?"
            autoComplete="off"
            aria-controls={resultsId}
            className="min-w-0 flex-1 bg-transparent py-3.5 font-serif text-[22px] text-navy outline-none placeholder:text-slate/60"
          />
        </div>
        <button type="submit" className="btn-primary min-h-[52px] px-7 text-[15px]">
          Search the guide
        </button>
      </div>

      <div id={resultsId} aria-live="polite">
        {q && results.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-navy/15 bg-white shadow-[0_24px_48px_-28px_rgba(21,22,57,0.55)]">
            {results.map((result) => (
              <li key={result.href} className="border-b border-navy/10 last:border-b-0">
                <Link
                  href={result.href}
                  className="flex flex-col px-5 py-3 transition hover:bg-paper hover:!no-underline"
                >
                  <span className="font-serif text-lg font-semibold text-navy">{result.label}</span>
                  <span className="text-sm text-slate/80">{result.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {q && results.length === 0 && (
          <p className={`mt-3 text-center text-sm ${submittedEmpty ? "text-navy" : "text-slate/80"}`}>
            Nothing matches “{query.trim()}” yet. Try a broader word, like “dentist” or “plumber”.
          </p>
        )}
      </div>
    </form>
  );
}
