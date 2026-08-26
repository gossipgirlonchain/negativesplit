"use client";

/* Shown once, after Stripe redirects back to /?claimed=NN. Reads the
   query off window rather than useSearchParams so the page stays
   statically rendered, and clears it from the URL afterwards. */

import { useEffect, useState } from "react";
import { BY_NO, CONTACT_EMAIL, TAKE_ALL, TOTAL_N } from "@/lib/positions";

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
  const mail = (
    <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--accent)" }}>
      {CONTACT_EMAIL}
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
          is yours. Send artwork to {mail} as an SVG or a 300dpi PNG and I will
          send a proof back.
        </>
      ) : claimed === TAKE_ALL.no ? (
        <>
          Thank you. <b>All {TOTAL_N} positions</b> are yours. Send artwork to{" "}
          {mail} as an SVG or a 300dpi PNG and I will send a proof back.
        </>
      ) : (
        <>
          Thank you. Send artwork to {mail} and I will send a proof back.
        </>
      )}
    </div>
  );
}
