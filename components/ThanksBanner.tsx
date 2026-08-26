"use client";

/* Shown once, after Stripe redirects back to /?claimed=NN. Reads the
   query off window rather than useSearchParams so the page stays
   statically rendered, and clears it from the URL afterwards. */

import { useEffect, useState } from "react";
import { BY_NO, TAKE_ALL, TOTAL_N } from "@/lib/positions";

export default function ThanksBanner() {
  const [claimed, setClaimed] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("claimed");
    if (!value) return;
    setClaimed(value);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.hash,
    );
  }, []);

  if (!claimed) return null;

  const position = BY_NO[claimed];
  const send = (
    <a href="/sponsor" style={{ color: "var(--accent)" }}>
      send your artwork
    </a>
  );

  return (
    <div className="thanks show">
      {position ? (
        <>
          Thank you.{" "}
          <b>
            No. {position.no}, {position.name}
          </b>{" "}
          is yours. Sign in with this email to {send}, an SVG or a 300dpi PNG,
          and I will send a proof back.
        </>
      ) : claimed === TAKE_ALL.no ? (
        <>
          Thank you. <b>All {TOTAL_N} positions</b> are yours. Sign in with this
          email to {send}, an SVG or a 300dpi PNG, and I will send a proof back.
        </>
      ) : (
        <>
          Thank you. Sign in with this email to {send} and I will send a proof
          back.
        </>
      )}
    </div>
  );
}
