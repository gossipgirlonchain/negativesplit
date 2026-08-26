const FALLBACK_SITE_URL = "https://www.negativesplit.space";

/** A missing scheme in NEXT_PUBLIC_SITE_URL used to throw inside new URL()
 *  and take the whole build down. A config typo should not be able to do
 *  that, so tolerate it and fall back rather than fail. */
export function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (!raw) return FALLBACK_SITE_URL;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}
