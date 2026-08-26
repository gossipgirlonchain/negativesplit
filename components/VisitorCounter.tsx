"use client";

/* Renders nothing until /api/visits has answered with real numbers.
   If the endpoint is down or KV is unreachable it answers 503 and this
   stays invisible. Fake social proof on a page asking brands for money
   is worse than no counter. */

import { useEffect, useState } from "react";
import { num } from "@/lib/money";

type Visits = { now: number; total: number };

export default function VisitorCounter() {
  const [visits, setVisits] = useState<Visits | null>(null);

  useEffect(() => {
    let alive = true;

    async function ping() {
      try {
        const r = await fetch("/api/visits", { method: "POST", cache: "no-store" });
        if (!r.ok) return;
        const d: unknown = await r.json();
        if (
          typeof d !== "object" ||
          d === null ||
          typeof (d as Visits).now !== "number" ||
          typeof (d as Visits).total !== "number"
        ) {
          return;
        }
        if (alive) setVisits({ now: (d as Visits).now, total: (d as Visits).total });
      } catch {
        /* endpoint down: keep the last real reading, or stay hidden */
      }
    }

    ping();
    const id = setInterval(ping, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!visits) return null;

  return (
    <div className="visitors">
      <span className="dot-live" />
      <span>
        <b>{num(visits.now)}</b> people visiting this site now
      </span>
      <span className="sep">·</span>
      <span>
        <b>{num(visits.total)}</b> total
      </span>
    </div>
  );
}
