"use client";

/* Client only so the fill keeps its 1.2s run-up from zero, which is a
   CSS transition and needs a width change to fire. */

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { INVENTORY, TOTAL_N } from "@/lib/positions";
import { money, pct } from "@/lib/money";

export default function Progress({
  raised,
  open,
}: {
  raised: number;
  open: number;
}) {
  // no goal: the track shows how much of the board has gone
  const target = pct(raised, INVENTORY);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <Reveal className="card progress">
      <div className="progress-top">
        <div>
          <div className="caption" style={{ marginBottom: 8 }}>
            Committed
          </div>
          <div className="fig">
            <span>{money(raised)}</span>
          </div>
        </div>
        <div className="right">
          <div className="caption" style={{ marginBottom: 8 }}>
            Available
          </div>
          <div className="fig" style={{ fontSize: 20 }}>
            <span>{open}</span>
            <span className="muted"> of </span>
            <span>{TOTAL_N}</span>
          </div>
        </div>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${width}%` }} />
        <div className="ticks">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
