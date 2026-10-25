"use client";

import type { AnchorHTMLAttributes } from "react";

type GtagFunction = (command: "event", eventName: string, params: Record<string, string>) => void;

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Business slug the click belongs to. */
  business: string;
  action: "call" | "website" | "directions";
}

/**
 * An outbound link that records a `directory_click` event in Google Analytics,
 * so featured members can be told how many calls, website visits and
 * direction requests their listing sent them.
 */
export function TrackedLink({ business, action, onClick, ...props }: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        const gtag = (window as unknown as { gtag?: GtagFunction }).gtag;
        if (typeof gtag === "function") {
          gtag("event", "directory_click", { business, action });
        }
        onClick?.(event);
      }}
    />
  );
}
