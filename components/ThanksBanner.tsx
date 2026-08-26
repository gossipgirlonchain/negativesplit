"use client";

/* Shown once, after Stripe redirects back to /?claimed=NN. Reads the
   query off window rather than useSearchParams so the page stays
   statically rendered, and clears it from the URL afterwards. */

import { useEffect, useState } from "react";
import { BY_NO, CONTACT_EMAIL, TAKE_ALL, TOTAL_N } from "@/lib/positions";

export default function ThanksBanner() {
  const [claimed, setClaimed] = useState<string | null>(null);
  const [taken, setTaken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("claimed");
    const gone = params.get("taken");
    if (!value && !gone) return;
    if (gone) setTaken(gone);
    if (value) setClaimed(value);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.hash,
    );
  }, []);

  // someone clicked Claim on a position that sold while they were reading
  if (taken) {
    const gone = BY_NO[taken];
    return (
      <div className="thanks show">
        {gone ? (
          <>
            <b>
              No. {gone.no}, {gone.name}
            </b>{" "}
            went while you were looking. Nothing was charged. The rest of the
            board is below.
          </>
        ) : (
          <>
            That position has gone. Nothing was charged. The rest of the board is
            below.
          </>
        )}
      </div>
    );
  }

  if (!claimed) return null;

  const position = BY_NO[claimed];
  const send = (
    <a href="/sponsor" style={{ color: "var(--accent)" }}>
      send your artwork
    </a>
  );
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
          is yours. Sign in with this email to {send}, an SVG or a 300dpi PNG,
          or just email it to {mail}. Either way you get a proof back.
        </>
      ) : claimed === TAKE_ALL.no ? (
        <>
          Thank you. <b>All {TOTAL_N} positions</b> are yours. Sign in with this
          email to {send}, an SVG or a 300dpi PNG, or just email it to {mail}.
          Either way you get a proof back.
        </>
      ) : (
        <>
          Thank you. Sign in with this email to {send}, or email it to {mail},
          and I will send a proof back.
        </>
      )}
    </div>
  );
}
