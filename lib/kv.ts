import { createClient } from "@vercel/kv";

/* ============================================================
   THE KEY VALUE STORE

   Vercel KV is now Upstash Redis from the Vercel Marketplace, and the
   integration names its variables however it likes. A store connected
   to this project arrives as negativesplit_KV_REST_API_URL, not
   KV_REST_API_URL, so match on the suffix rather than the exact name
   and the store works however Vercel wires it up.
   ============================================================ */

/** Exact name first, then any prefixed variant of it. */
function findEnv(names: string[]): string {
  for (const name of names) {
    const exact = process.env[name];
    if (exact) return exact;
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (names.some((name) => key.endsWith(`_${name}`))) return value;
  }
  return "";
}

// READ_ONLY_TOKEN does not end in KV_REST_API_TOKEN, so it is never picked up
const credentials = () => ({
  url: findEnv(["KV_REST_API_URL", "UPSTASH_REDIS_REST_URL"]),
  token: findEnv(["KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN"]),
});

/** True once a store is wired up. Absent locally is fine and means
 *  "nothing has sold"; absent in production is a misconfiguration. */
export function kvConfigured(): boolean {
  const { url, token } = credentials();
  return Boolean(url && token);
}

let client: ReturnType<typeof createClient> | null = null;

export function kv() {
  if (!client) {
    const { url, token } = credentials();
    client = createClient({ url, token });
  }
  return client;
}
