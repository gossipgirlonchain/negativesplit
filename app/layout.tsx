import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/positions";

const FALLBACK_SITE_URL = "https://www.negativesplit.space";

/** A missing scheme in NEXT_PUBLIC_SITE_URL used to throw inside new URL()
 *  and take the whole build down. A config typo should not be able to do
 *  that, so tolerate it and fall back rather than fail. */
function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (!raw) return FALLBACK_SITE_URL;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).toString().replace(/\/$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const siteUrl = resolveSiteUrl();
const description = "Your brand, on my Ironman journey.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_NAME,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description,
    creator: "@winternet",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
