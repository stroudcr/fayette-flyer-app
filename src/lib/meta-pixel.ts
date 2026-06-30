type MetaPixelEventName = "PageView" | "Lead";
type MetaPixelParameters = Record<string, string | number | boolean>;

export type MetaPixelFunction = {
  (method: "init", pixelId: string): void;
  (
    method: "track",
    eventName: MetaPixelEventName,
    parameters?: MetaPixelParameters
  ): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: MetaPixelFunction;
  queue?: unknown[][];
  version?: string;
};

declare global {
  interface Window {
    _fbq?: MetaPixelFunction;
    __fayetteMetaPixelId?: string;
    fbq?: MetaPixelFunction;
  }
}

export function trackMetaPixelEvent(
  eventName: MetaPixelEventName,
  parameters?: MetaPixelParameters
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, parameters);
}

export function trackNewsletterSignupLead(formVariant: string) {
  trackMetaPixelEvent("Lead", {
    content_name: "Newsletter signup",
    content_category: "Newsletter",
    signup_variant: formVariant,
  });
}
