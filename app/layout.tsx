import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME } from "@/lib/positions";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://negativesplit.space";
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
