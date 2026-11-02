import "server-only";
import { SITE_CONFIG } from "@/lib/seo/constants";
import { env } from "./env";

interface Message {
  to: string;
  subject: string;
  /** Paragraphs of plain text. A paragraph that is a URL becomes a button; "[Label](https://…)" becomes a button with that label. */
  paragraphs: string[];
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const LABELED_BUTTON = /^\[([^\]]{1,60})\]\((https?:\/\/\S+)\)$/;

/** A paragraph that should render as a button: a bare URL, or "[Label](URL)". */
export function buttonFrom(paragraph: string): { label: string; url: string } | null {
  const labeled = LABELED_BUTTON.exec(paragraph);
  if (labeled) return { label: labeled[1], url: labeled[2] };
  return /^https?:\/\/\S+$/.test(paragraph) ? { label: "Open link", url: paragraph } : null;
}

function renderText(paragraphs: string[]): string {
  return paragraphs
    .map((p) => {
      const button = buttonFrom(p);
      return button && button.label !== "Open link" ? `${button.label}: ${button.url}` : p;
    })
    .join("\n\n");
}

function renderHtml(paragraphs: string[]): string {
  const body = paragraphs
    .map((p) => {
      const button = buttonFrom(p);
      return button
        ? `<p style="margin:24px 0"><a href="${escapeHtml(button.url)}" style="display:inline-block;background:#1c1e4d;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600">${escapeHtml(button.label)}</a></p><p style="margin:0 0 16px;font-size:13px;color:#4b5563;word-break:break-all">${escapeHtml(button.url)}</p>`
        : `<p style="margin:0 0 16px">${escapeHtml(p)}</p>`;
    })
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#fafaf9;font-family:Helvetica,Arial,sans-serif;color:#374151;font-size:16px;line-height:1.55">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="margin:0 0 24px;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1c1e4d">The Fayette Flyer &middot; Local Business Guide</p>
${body}
<p style="margin:32px 0 0;font-size:13px;color:#6b7280">Questions? Reply to ${escapeHtml(SITE_CONFIG.email)}.</p>
</div></body></html>`;
}

/**
 * Sends one email through Cloudflare Email Service. Returns false (and logs)
 * when email isn't configured or Cloudflare refuses, so callers can carry on.
 */
export async function sendEmail(message: Message): Promise<boolean> {
  const accountId = env.cloudflareAccountId();
  const token = env.cloudflareEmailToken();
  if (!accountId || !token) {
    console.warn(`[guide email] Not sent (Cloudflare email not configured): "${message.subject}"`);
    return false;
  }

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        to: message.to,
        from: env.emailFrom(),
        subject: message.subject,
        text: renderText(message.paragraphs),
        html: renderHtml(message.paragraphs),
      }),
    });
    const data = (await response.json().catch(() => null)) as { success?: boolean; errors?: { code: number; message: string }[] } | null;
    if (!response.ok || !data?.success) {
      console.error(`[guide email] Cloudflare refused "${message.subject}":`, response.status, data?.errors);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[guide email] Failed to send "${message.subject}":`, error);
    return false;
  }
}

/** Sends the same message to every guide admin. */
export async function emailAdmins(subject: string, paragraphs: string[]) {
  const admins = env.adminEmails();
  await Promise.all(admins.map((to) => sendEmail({ to, subject, paragraphs })));
}
