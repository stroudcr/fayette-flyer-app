/**
 * Cleans Beehiiv free_web_content HTML to remove the duplicate header
 * and strip inline styles that clash with the site's design system.
 */
export function cleanBeehiivContent(html: string): string {
  let cleaned = html;

  // 1. Remove everything from the #web-header div up to #content-blocks.
  //    Uses a landmark-based approach to avoid fragile nested-div regex.
  const webHeaderStart = cleaned.indexOf('id="web-header"');
  const contentBlocksStart = cleaned.indexOf('id="content-blocks"');

  if (webHeaderStart !== -1 && contentBlocksStart !== -1 && contentBlocksStart > webHeaderStart) {
    // Walk backwards from the id attr to find the opening <div
    const divOpen = cleaned.lastIndexOf("<div", webHeaderStart);
    // Walk backwards from content-blocks id to find its opening <div
    const contentDiv = cleaned.lastIndexOf("<div", contentBlocksStart);

    if (divOpen !== -1 && contentDiv !== -1 && contentDiv > divOpen) {
      cleaned = cleaned.slice(0, divOpen) + cleaned.slice(contentDiv);
    }
  }

  // 2. Strip inline font-family declarations so site fonts take over
  cleaned = cleaned.replace(/font-family\s*:[^;"]+;?/gi, "");

  // 3. Remove max-width from .rendered-post inline styles
  cleaned = cleaned.replace(/max-width\s*:\s*672px\s*;?/gi, "");

  // 4. Remove Beehiiv CSS custom properties (--bh-*, --wt-*)
  cleaned = cleaned.replace(/--(?:bh|wt)-[a-zA-Z0-9-]+\s*:[^;"]+;?/gi, "");

  // 5. Clean up leftover empty style attributes
  cleaned = cleaned.replace(/\s*style\s*=\s*"[\s;]*"/gi, "");

  return cleaned;
}
