import { createClient } from "@vercel/kv";

/* ============================================================
   THE KEY VALUE STORE

   Vercel KV is now Upstash Redis from the Vercel Marketplace, and the
   two write different variable names. Accept either, so connecting the
   store works whichever way Vercel wires it up.
   ============================================================ */

const url =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const token =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

/** True once a store is wired up. Absent locally is fine and means
 *  "nothing has sold"; absent in production is a misconfiguration. */
export function kvConfigured(): boolean {
  return Boolean(url && token);
}

let client: ReturnType<typeof createClient> | null = null;

export function kv() {
  if (!client) client = createClient({ url, token });
  return client;
}
