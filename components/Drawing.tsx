"use client";

/* The drawing, copied across from the single-file version. Geometry is
   untouched: same viewBox, same paths, same zone ids. The only thing
   added is the wiring — each <g class="zone"> reports hover/focus to
   the shared state, and the callout is positioned from this component,
   which owns the SVG it measures. */

import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { BY_TARGET, buyHref } from "@/lib/positions";
import { money } from "@/lib/money";
import { hoverHandlers, useHover } from "./HoverSync";

export default function Drawing({ sold }: { sold: string[] }) {
  const soldSet = useMemo(() => new Set(sold), [sold]);
  const { active, setActive } = useHover();

  const svgRef = useRef<SVGSVGElement>(null);
  const calloutRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGRectElement>(null);
  const txtRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const callout = calloutRef.current;
    const bg = bgRef.current;
    const txt = txtRef.current;
    if (!svg || !callout || !bg || !txt) return;

    const p = active ? BY_TARGET[active] : undefined;
    const g = active
      ? svg.querySelector<SVGGElement>(`[id="${active}"]`)
      : null;

    if (!p || !g) {
      callout.style.opacity = "0";
      return;
    }

    const label = p.name + "  ·  " + (soldSet.has(p.no) ? "Sold" : money(p.price));
    txt.textContent = label;
    const w = label.length * 6.6 + 26;
    bg.setAttribute("width", String(w));

    const vb = svg.viewBox.baseVal;
    const bb = g.getBBox();
    const x = Math.max(
      vb.x + 4,
      Math.min(vb.x + vb.width - w - 4, bb.x + bb.width / 2 - w / 2),
    );
    let y = bb.y - 34;
    if (y < vb.y + 4) y = bb.y + bb.height + 12;

    callout.setAttribute("transform", `translate(${x},${y})`);
    callout.style.opacity = "1";
  }, [active, soldSet]);

  function zone(target: string) {
    const p = BY_TARGET[target];
    const isSold = soldSet.has(p.no);
    const go = () => {
      if (!isSold) window.location.href = buyHref(p.no, p.name);
    };
    return {
      id: target,
      className: ["zone", isSold ? "sold" : "", active === target ? "on" : ""]
        .filter(Boolean)
        .join(" "),
      tabIndex: 0,
      role: "button" as const,
      "aria-label": p.name,
      ...hoverHandlers(target, setActive),
      onClick: go,
      onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      },
    };
  }

  return (
    <svg
      ref={svgRef}
      className="hero-svg"
      viewBox="0 0 1250 436"
      role="img"
      aria-label="Technical drawing of a triathlon suit front and back, an aero helmet from the side and front, and a time trial frameset, with eleven numbered sponsor positions marked in pink"
    >
      {/* ---------- suit, front ---------- */}
      <g transform="translate(-11.8,-17.8) scale(0.95)">
        <path
          className="shape"
          d="M140 44 C124 44 116 47 110 52 L86 64 C66 74 50 100 44 126 L62 152 C70 140 78 134 86 130 L82 196 C78 240 76 268 74 296 L70 380 L78 414 L128 406 L140 368 L152 406 L202 414 L210 380 L206 296 C204 268 202 240 198 196 L194 130 C202 134 210 140 218 152 L236 126 C230 100 214 74 194 64 L170 52 C164 47 156 44 140 44 Z"
        />
        <path className="hair" d="M110 52 C104 74 96 104 92 130" />
        <path className="hair" d="M170 52 C176 74 184 104 188 130" />
        <path className="hair" d="M74 296 C104 308 176 308 206 296" />
        <path className="hair" d="M112 50 C126 58 154 58 168 50" />
        <line className="hair" x1="140" y1="54" x2="140" y2="150" />
      </g>

      {/* ---------- suit, back ---------- */}
      <g transform="translate(188.2,-17.8) scale(0.95)">
        <path
          className="shape"
          d="M140 44 C124 44 116 47 110 52 L86 64 C66 74 50 100 44 126 L62 152 C70 140 78 134 86 130 L82 196 C78 240 76 268 74 296 L70 380 L78 414 L128 406 L140 368 L152 406 L202 414 L210 380 L206 296 C204 268 202 240 198 196 L194 130 C202 134 210 140 218 152 L236 126 C230 100 214 74 194 64 L170 52 C164 47 156 44 140 44 Z"
        />
        <path className="hair" d="M110 52 C104 74 96 104 92 130" />
        <path className="hair" d="M170 52 C176 74 184 104 188 130" />
        <path className="hair" d="M112 50 C126 56 154 56 168 50" />
        <path className="hair" d="M74 296 C104 308 176 308 206 296" />
      </g>

      {/* ---------- helmet, side ---------- */}
      <g transform="translate(448,126.8) scale(0.85)">
        <path
          className="shape"
          d="M0 40 C2 6 30 -8 62 -8 C104 -8 128 8 138 28 C144 40 134 48 118 52 C86 60 44 62 22 60 C4 58 -1 52 0 40 Z"
        />
        <path className="hair" d="M18 -2 C42 40 78 52 126 50" />
      </g>

      {/* ---------- helmet, front ---------- */}
      <g transform="translate(448,256.8) scale(0.85)">
        <path
          className="shape"
          d="M45 -8 C74 -8 90 14 90 40 C90 60 74 68 45 68 C16 68 0 60 0 40 C0 14 16 -8 45 -8 Z"
        />
        <path className="hair" d="M8 34 C24 50 66 50 82 34 C80 56 66 64 45 64 C24 64 10 56 8 34 Z" />
      </g>

      {/* ---------- the bike ---------- */}
      <g transform="translate(576,-31.5) scale(0.85)">
        {/* wheels: shown, not for sale */}
        <g className="wheel">
          <circle className="tyre" cx="180" cy="340" r="140" />
          <circle className="shape" cx="180" cy="340" r="130" />
          <circle className="shape" cx="180" cy="340" r="98" />
          <g className="hair">
            <line x1="82" y1="340" x2="278" y2="340" />
            <line x1="180" y1="242" x2="180" y2="438" />
            <line x1="111" y1="271" x2="249" y2="409" />
            <line x1="111" y1="409" x2="249" y2="271" />
            <line x1="90" y1="303" x2="270" y2="377" />
            <line x1="90" y1="377" x2="270" y2="303" />
            <line x1="143" y1="249" x2="217" y2="431" />
            <line x1="217" y1="249" x2="143" y2="431" />
          </g>
          <circle className="shape" cx="180" cy="340" r="16" />
        </g>
        <g className="wheel">
          <circle className="tyre" cx="620" cy="340" r="140" />
          <circle className="shape" cx="620" cy="340" r="130" />
          <circle className="shape" cx="620" cy="340" r="98" />
          <g className="hair">
            <line x1="522" y1="340" x2="718" y2="340" />
            <line x1="620" y1="242" x2="620" y2="438" />
            <line x1="551" y1="271" x2="689" y2="409" />
            <line x1="551" y1="409" x2="689" y2="271" />
            <line x1="530" y1="303" x2="710" y2="377" />
            <line x1="530" y1="377" x2="710" y2="303" />
            <line x1="583" y1="249" x2="657" y2="431" />
            <line x1="657" y1="249" x2="583" y2="431" />
          </g>
          <circle className="shape" cx="620" cy="340" r="16" />
        </g>

        {/* frame */}
        <path className="shape" d="M180 332 L365 330 L365 352 L180 348 Z" />
        <path className="shape" d="M388.3 199.1 L178.3 332.1 L185.7 343.9 L395.7 210.9 Z" />
        <path className="shape" d="M381.7 343.4 L426.7 123.4 L393.4 116.6 L348.4 336.6 Z" />
        <path className="shape" d="M376.2 361.2 L615.2 235.2 L592.8 192.8 L353.8 318.8 Z" />
        <path className="shape" d="M399.7 195.9 L595.7 171.9 L592.3 144.1 L396.3 168.1 Z" />
        <path className="shape" d="M573.8 151.2 L595.8 219.2 L628.2 208.8 L606.2 140.8 Z" />
        <path className="shape" d="M601 213 L609 341 L635 339 L627 211 Z" />

        {/* drivetrain */}
        <circle className="hair" cx="365" cy="340" r="46" />
        <line className="stroke" x1="365" y1="340" x2="388" y2="390" strokeWidth="9" />
        <line className="stroke" x1="376" y1="394" x2="400" y2="386" strokeWidth="7" />
        <circle className="shape" cx="365" cy="340" r="20" />

        {/* saddle */}
        <path
          className="shape"
          d="M378 118 C374 106 384 99 396 98 L452 94 C465 93 465 106 452 108 L390 121 C382 122 379 122 378 118 Z"
        />

        {/* bullhorn cockpit */}
        <line className="stroke" x1="590" y1="150" x2="590" y2="138" strokeWidth="12" />
        <line className="stroke" x1="552" y1="140" x2="628" y2="140" strokeWidth="11" />
        <path className="stroke" d="M628 140 C654 140 663 158 661 180" strokeWidth="10" />
      </g>

      {/* ---------- dimensions ---------- */}
      <g className="dim">
        <line x1="729" y1="414" x2="1103" y2="414" />
        <line x1="729" y1="407" x2="729" y2="421" />
        <line x1="1103" y1="407" x2="1103" y2="421" />
      </g>
      <text className="dimtext" x="916" y="407" textAnchor="middle">
        985 MM
      </text>

      <g className="dim">
        <line x1="68" y1="258" x2="174.4" y2="258" />
        <line x1="68" y1="252" x2="68" y2="264" />
        <line x1="174.4" y1="252" x2="174.4" y2="264" />
      </g>
      <text className="dimtext" x="121.2" y="251" textAnchor="middle">
        14 CM
      </text>

      {/* ---------- labels ---------- */}
      <text className="tag" x="121.2" y="400" textAnchor="middle">
        FRONT
      </text>
      <text className="tag" x="321.2" y="400" textAnchor="middle">
        BACK
      </text>
      <text className="tag" x="507.5" y="200" textAnchor="middle">
        HELMET / SIDE
      </text>
      <text className="tag" x="486.3" y="330" textAnchor="middle">
        HELMET / FRONT
      </text>

      {/* ---------- positions ---------- */}
      <g {...zone("k-front-up")}>
        <rect className="plate" x="69.9" y="84.8" width="102.6" height="72.2" rx="9" />
        <text className="code" x="121.2" y="120.9">
          01
        </text>
      </g>
      <g {...zone("k-back-up")}>
        <rect className="plate" x="268" y="81" width="106.4" height="79.8" rx="9" />
        <text className="code" x="321.2" y="120.9">
          02
        </text>
      </g>
      <g {...zone("k-front-lo")}>
        <rect className="plate" x="68" y="166.5" width="106.4" height="79.8" rx="9" />
        <text className="code" x="121.2" y="206.4">
          03
        </text>
      </g>
      <g {...zone("k-back-lo")}>
        <rect className="plate" x="268" y="166.5" width="106.4" height="79.8" rx="9" />
        <text className="code" x="321.2" y="206.4">
          04
        </text>
      </g>
      <g {...zone("k-sleeves")}>
        <rect
          className="plate"
          x="-21.9"
          y="-16.2"
          width="43.7"
          height="32.3"
          rx="7"
          transform="translate(43.3,82.9) rotate(-60)"
        />
        <rect
          className="plate"
          x="-21.9"
          y="-16.2"
          width="43.7"
          height="32.3"
          rx="7"
          transform="translate(197.2,82.9) rotate(60)"
        />
        <text className="code" x="43.3" y="82.9">
          05
        </text>
        <text className="code" x="197.2" y="82.9">
          05
        </text>
      </g>
      <g {...zone("b-helmet")}>
        <rect className="plate" x="482" y="133.6" width="54.4" height="23.8" rx="7" />
        <text className="code" x="509.2" y="145.5">
          09
        </text>
      </g>
      <g {...zone("b-helmet-f")}>
        <rect className="plate" x="461.6" y="263.6" width="49.3" height="22.1" rx="7" />
        <text className="code" x="486.2" y="274.6">
          10
        </text>
      </g>
      <g {...zone("b-dt-low")}>
        <rect
          className="plate"
          x="-42.5"
          y="-16.2"
          width="85"
          height="32.3"
          rx="8"
          transform="translate(941.1,228.6) rotate(-27.8)"
        />
        <text className="code" x="941.1" y="228.6">
          06
        </text>
      </g>
      <g {...zone("b-dt-up")}>
        <rect
          className="plate"
          x="-42.5"
          y="-16.2"
          width="85"
          height="32.3"
          rx="8"
          transform="translate(1028.5,182.5) rotate(-27.8)"
        />
        <text className="code" x="1028.5" y="182.5">
          07
        </text>
      </g>
      <g {...zone("b-fork")}>
        <rect
          className="plate"
          x="-38.3"
          y="-9.4"
          width="76.5"
          height="18.7"
          rx="6"
          transform="translate(1101.3,203.1) rotate(86.4)"
        />
        <text className="code" x="1101.3" y="203.1">
          08
        </text>
      </g>
      <g {...zone("b-headtube")}>
        <rect
          className="plate"
          x="-18.7"
          y="-11.1"
          width="37.4"
          height="22.1"
          rx="6"
          transform="translate(1086.9,121.5) rotate(72)"
        />
        <text className="code" x="1086.9" y="121.5">
          11
        </text>
      </g>

      <g className="callout" ref={calloutRef} style={{ opacity: 0 }}>
        <rect ref={bgRef} className="cbg" x="0" y="0" width="200" height="30" rx="15" fill="var(--text)" />
        <text
          ref={txtRef}
          className="ctx"
          x="15"
          y="20"
          fill="var(--bg)"
          fontSize="14"
          fontWeight="500"
        >
          .
        </text>
      </g>
    </svg>
  );
}
