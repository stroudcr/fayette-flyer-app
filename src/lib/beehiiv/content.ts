import * as cheerio from "cheerio";

/**
 * Cleans Beehiiv free_web_content HTML to remove the duplicate header
 * and strip inline styles that clash with the site's design system.
 */
export function cleanBeehiivContent(html: string): string {
  const $ = cheerio.load(html, { xml: false });

  // 1. Remove all #web-header elements (Beehiiv sends duplicates)
  $("#web-header").remove();

  // 2. Remove Beehiiv byline/social wrappers
  $(".bh__byline_wrapper").remove();
  $(".bh__byline_social_wrapper").remove();

  // 3. Strip problematic inline styles from each element individually
  $("[style]").each(function () {
    const el = $(this);
    let style = el.attr("style") || "";

    // Remove font-family declarations
    style = style.replace(/font-family\s*:[^;"]+;?/gi, "");

    // Remove max-width: 672px (Beehiiv's content constraint)
    style = style.replace(/max-width\s*:\s*672px\s*;?/gi, "");

    // Remove Beehiiv CSS custom property declarations (--bh-*, --wt-*)
    style = style.replace(/--(?:bh|wt)-[a-zA-Z0-9-]+\s*:[^;"]+;?/gi, "");

    // Remove any declaration that references Beehiiv CSS variables via var()
    // e.g. "color:var(--wt-text-on-background-color) !important"
    style = style.replace(/[a-z-]+\s*:\s*[^;]*var\(--(?:bh|wt)-[^)]*\)[^;]*;?/gi, "");

    // Clean up collapsed semicolons and whitespace
    style = style
      .replace(/;\s*;+/g, ";")
      .replace(/^\s*;\s*/, "")
      .replace(/\s*;\s*$/, "")
      .trim();

    if (style) {
      el.attr("style", style);
    } else {
      el.removeAttr("style");
    }
  });

  // 4. Neutralize Beehiiv wrapper classes
  $(".bg-wt-background").removeClass("bg-wt-background");
  $(".text-wt-text-on-background").removeClass("text-wt-text-on-background");

  // Remove empty class attributes left behind
  $("[class]").each(function () {
    const el = $(this);
    if (!el.attr("class")?.trim()) {
      el.removeAttr("class");
    }
  });

  // cheerio.load wraps content in <html><body>, so extract body innerHTML
  return $("body").html() || "";
}
