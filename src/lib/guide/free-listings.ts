import "server-only";
import { sql } from "./db";
import { slugify, type ListingContent } from "./content";
import type { FreeSubmission } from "./free-content";

const COLUMNS = "id, slug, claimed_slug, category, status, owner_email, contact_name, contact_role, content, admin_note, created_at, reviewed_at";

function normalize(row: FreeSubmission): FreeSubmission {
  return { ...row, created_at: new Date(row.created_at).toISOString(), reviewed_at: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null };
}

export async function freeSubmissions(publicOnly = false): Promise<FreeSubmission[]> {
  const rows = await sql<FreeSubmission>(`select ${COLUMNS} from guide_free_submissions ${publicOnly ? "where status = 'live' order by reviewed_at, created_at" : "order by created_at desc"}`);
  return rows.map(normalize);
}

export async function createFreeSubmission(input: {
  content: ListingContent; category: string; email: string; contactName: string; contactRole: string;
  claim: string; requesterHash: string; existingSlugs: string[];
}) {
  const recent = await sql<{ n: number }>(
    `select count(*)::int as n from guide_free_submissions where created_at > now() - interval '1 hour'
     and (owner_email = $1 or requester_hash = $2)`, [input.email, input.requesterHash]
  );
  if ((recent[0]?.n ?? 0) >= 5) return { limited: true } as const;

  const duplicate = await sql(
    `select 1 from guide_free_submissions where status = 'pending' and owner_email = $1 and category = $2
     and (($3::text <> '' and claimed_slug = $3) or ($3::text = '' and claimed_slug is null and lower(content->>'name') = lower($4))) limit 1`,
    [input.email, input.category, input.claim, input.content.name]
  );
  if (duplicate.length) return { listing: null } as const;

  let slug = input.claim || slugify(input.content.name) || "business";
  if (!input.claim) {
    const reserved = await sql<{ slug: string }>(`select slug from guide_free_submissions union select slug from guide_listings`);
    const taken = new Set([...input.existingSlugs, ...reserved.map((r) => r.slug)]);
    const base = slug;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  }
  const rows = await sql<FreeSubmission>(
    `insert into guide_free_submissions (slug, claimed_slug, category, owner_email, contact_name, contact_role, requester_hash, content)
     values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb) on conflict do nothing returning ${COLUMNS}`,
    [slug, input.claim || null, input.category, input.email, input.contactName, input.contactRole, input.requesterHash, JSON.stringify(input.content)]
  );
  return { listing: rows[0] ? normalize(rows[0]) : null } as const;
}

/** Called only after the server action has verified the admin's signed session. */
export async function reviewFreeSubmission(id: string, status: "live" | "rejected" | "hidden", admin: string, note: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await sql<FreeSubmission>(
    `update guide_free_submissions set status = $2, reviewed_by = $3, admin_note = $4, reviewed_at = now()
     where id = $1 and (($2 in ('live', 'rejected') and status = 'pending') or ($2 = 'hidden' and status = 'live')) returning ${COLUMNS}`,
    [id, status, admin, note || null]
  );
  return rows[0] ? normalize(rows[0]) : null;
}
