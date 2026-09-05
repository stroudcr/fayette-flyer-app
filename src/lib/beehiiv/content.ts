import * as cheerio from "cheerio";
import sanitizeHtml from "sanitize-html";

const ADVERTISER_LOGO_PATH = "/uploads/ad_network/advertiser/logo/";

// Preserve the web renderer's visual declarations, without accepting scripts,
// global stylesheets, positioning, or CSS that loads additional resources.
const SAFE_STYLE_VALUE = /^(?!.*(?:url\s*\(|expression\s*\(|[\\{}<>])).+$/i;
const CONTENT_STYLE_PROPERTIES = [
  "color", "background-color", "text-align", "text-decoration",
  "text-decoration-color", "text-decoration-line", "text-decoration-style",
  "text-transform", "font-family", "font-size", "font-weight", "font-style",
  "line-height", "letter-spacing", "white-space", "word-break", "overflow-wrap",
  "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "width", "max-width", "height", "min-height", "max-height", "box-sizing",
  "border", "border-top", "border-right", "border-bottom", "border-left",
  "border-width", "border-style", "border-color", "border-radius",
  "border-collapse", "border-spacing", "vertical-align", "table-layout",
  "display", "flex-direction", "flex-wrap", "align-items", "justify-content",
  "gap", "row-gap", "column-gap", "flex", "flex-grow", "flex-shrink", "flex-basis",
];

const CONTENT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "picture", "source", "video", "audio", "iframe",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "loading", "decoding", "srcset", "sizes"],
    iframe: ["src", "width", "height", "frameborder", "allowfullscreen", "allow", "title"],
    video: ["src", "controls", "width", "height", "poster"],
    audio: ["src", "controls"],
    source: ["src", "srcset", "type", "media", "sizes"],
    a: ["href", "target", "rel", "title"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
    ol: ["start", "reversed", "type"],
    li: ["value"],
    "*": ["class", "id", "style"],
  },
  allowedStyles: {
    "*": Object.fromEntries(CONTENT_STYLE_PROPERTIES.map((property) => [property, [SAFE_STYLE_VALUE]])),
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
};

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
 * Prepares and sanitizes Beehiiv free_web_content for the site's issue renderer.
 * Keep the post's inline typography, spacing, and dividers; remove duplicate
 * chrome and references to Beehiiv's separate website theme.
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

    // Newer web renders already stack the sponsor with a deliberate gap.
    if (styleHasDeclaration(flexWrapper.attr("style"), "flex-direction", "column")) {
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
  return sanitizeHtml($("body").html() || "", CONTENT_SANITIZE_OPTIONS);
}
