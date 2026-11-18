type GtagEventParameters = Record<string, string | number | boolean | undefined>;

type GtagFunction = (command: "event", eventName: string, parameters?: GtagEventParameters) => void;

/** Sends a GA4 event through the gtag snippet in the root layout, if it has loaded. */
export function trackGaEvent(eventName: string, parameters?: GtagEventParameters) {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as unknown as { gtag?: GtagFunction }).gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", eventName, parameters);
}

/**
 * Records a completed newsletter signup as `newsletter_signup` in GA4.
 * This event is marked as a key event in the GA4 property, so signups can be
 * compared by traffic source (Google, Facebook, ChatGPT, newsletter links...).
 */
export function trackNewsletterSignupGa(formVariant: string, campaign?: string) {
  trackGaEvent("newsletter_signup", {
    form_variant: formVariant,
    signup_campaign: campaign,
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}
