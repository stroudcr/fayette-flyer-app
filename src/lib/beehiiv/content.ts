import * as cheerio from "cheerio";

const ADVERTISER_LOGO_PATH = "/uploads/ad_network/advertiser/logo/";

function styleHasDeclaration(style: string | undefined, property: string, value: string): boolean {
  if (!style) {
    return false;
  }

  return style
    .split(";")
    .some((declaration) => {
      const [name, ...rest] = declaration.split(":");
      const normalizedValue = rest
        .join(":")
        .replace(/\s*!important\s*$/i, "")
        .trim()
        .toLowerCase();

      return name?.trim().toLowerCase() === property.toLowerCase() &&
        normalizedValue === value.toLowerCase();
    });
}

function setStyleDeclaration(style: string | undefined, property: string, value: string): string {
  const declarations = (style || "")
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .filter((declaration) => {
      const [name] = declaration.split(":");
      return name?.trim().toLowerCase() !== property.toLowerCase();
    });

  declarations.unshift(`${property}:${value}`);

  return declarations.join(";");
}

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

  // 5. Beehiiv's web advertiser logo block can arrive as a row flex layout,
  // which offsets the label beside the logo. Only normalize the ad-network
  // logo wrapper so regular linked images and in-body ad creatives are left alone.
  $(`img[src*="${ADVERTISER_LOGO_PATH}"]`).each(function () {
    const logo = $(this);
    const link = logo.closest("a");
    const flexWrapper = link
      .parents()
      .filter((_, element) => styleHasDeclaration($(element).attr("style"), "display", "flex"))
      .first();

    if (!link.length || !flexWrapper.length) {
      return;
    }

    flexWrapper.attr(
      "style",
      setStyleDeclaration(flexWrapper.attr("style"), "display", "block")
    );
    link.attr("style", setStyleDeclaration(link.attr("style"), "display", "block"));
  });

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
