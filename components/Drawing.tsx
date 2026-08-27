"use client";

/* The drawing, copied across from the single-file version. Geometry is
   untouched: same viewBox, same paths, same zone ids. The only thing
   added is the wiring — each <g class="zone"> reports hover/focus to
   the shared state, and the callout is positioned from this component,
   which owns the SVG it measures. */

import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { BY_TARGET, TOTAL_N, buyHref } from "@/lib/positions";
import type { PublicSponsor } from "@/lib/sponsors";
import type { Board } from "@/lib/boards";
import { money } from "@/lib/money";
import { hoverHandlers, useHover } from "./HoverSync";

/* The drawing is wider than a phone and sits in a horizontal scroller, so
   whatever is left-most is all most people ever see. The bike leads.
   These shift the three clusters without touching any inner coordinate. */
const SUIT_DX = 728;
const HELMET_DX = 220;
const BIKE_DX = -566;

function clusterDx(target: string): number {
  if (target.startsWith("k-")) return SUIT_DX;
  if (target.startsWith("b-helmet")) return HELMET_DX;
  return BIKE_DX;
}
import { ZONES, ZONE_ORDER } from "./zones";

export default function Drawing({
  sold,
  sponsors,
  board,
}: {
  sold: string[];
  sponsors: Record<string, PublicSponsor>;
  board: Board;
}) {
  const soldSet = useMemo(() => new Set(sold), [sold]);
  const { active, setActive } = useHover();

  const svgRef = useRef<SVGSVGElement>(null);
  const calloutRef = useRef<SVGGElement>(null);
  const bgRef = useRef<SVGRectElement>(null);
  const txtRef = useRef<SVGTextElement>(null);
  const imgRef = useRef<SVGImageElement>(null);
  const plateRef = useRef<SVGRectElement>(null);
  const urlRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const callout = calloutRef.current;
    const bg = bgRef.current;
    const txt = txtRef.current;
    const img = imgRef.current;
    const plate = plateRef.current;
    const url = urlRef.current;
    if (!svg || !callout || !bg || !txt || !img || !plate || !url) return;

    const p = active ? BY_TARGET[active] : undefined;
    const g = active
      ? svg.querySelector<SVGGElement>(`[id="${active}"]`)
      : null;

    if (!p || !g) {
      callout.style.opacity = "0";
      return;
    }

    const sponsor = sponsors[p.no];
    let width: number;
    let height: number;

    if (sponsor) {
      // A sponsor gets a card: the mark at a size you can actually read,
      // the brand under it, and the site it goes to. The logo sits on a
      // white plate because half these marks are dark and the card is not.
      const PAD = 14;
      const LOGO_H = 58;
      const PLATE_H = LOGO_H + 16;
      const brand = sponsor.brand;
      const site = sponsor.url
        ? sponsor.url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
        : "";

      width = Math.min(
        320,
        Math.max(200, brand.length * 8.4 + PAD * 2, site.length * 6.6 + PAD * 2),
      );

      const plateY = PAD;
      const brandY = plateY + PLATE_H + 24;
      const siteY = brandY + 18;
      height = (site ? siteY : brandY) + PAD + 4;

      bg.setAttribute("width", String(width));
      bg.setAttribute("height", String(height));
      bg.setAttribute("rx", "12");

      plate.setAttribute("x", String(PAD));
      plate.setAttribute("y", String(plateY));
      plate.setAttribute("width", String(width - PAD * 2));
      plate.setAttribute("height", String(PLATE_H));
      plate.style.display = "";

      img.setAttribute("href", sponsor.logoUrl ?? "");
      img.setAttribute("x", String(PAD + 10));
      img.setAttribute("y", String(plateY + 8));
      img.setAttribute("width", String(width - PAD * 2 - 20));
      img.setAttribute("height", String(LOGO_H));
      img.style.display = sponsor.logoUrl ? "" : "none";
      if (!sponsor.logoUrl) plate.style.display = "none";

      txt.textContent = brand;
      txt.setAttribute("x", String(width / 2));
      txt.setAttribute("y", String(sponsor.logoUrl ? brandY : plateY + 22));
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "15");
      txt.setAttribute("letter-spacing", "0");

      if (site) {
        url.textContent = site;
        url.setAttribute("x", String(width / 2));
        url.setAttribute(
          "y",
          String(sponsor.logoUrl ? siteY : plateY + 40),
        );
        url.style.display = "";
        if (!sponsor.logoUrl) height = plateY + 40 + PAD + 4;
      } else {
        url.style.display = "none";
        if (!sponsor.logoUrl) height = plateY + 22 + PAD + 6;
      }
      bg.setAttribute("height", String(height));
    } else {
      const label =
        p.name + "  ·  " + (soldSet.has(p.no) ? "Sold" : money(p.price));
      width = label.length * 6.6 + 26;
      height = 30;

      bg.setAttribute("width", String(width));
      bg.setAttribute("height", String(height));
      bg.setAttribute("rx", "15");

      img.style.display = "none";
      plate.style.display = "none";
      url.style.display = "none";

      txt.textContent = label;
      txt.setAttribute("x", "15");
      txt.setAttribute("y", "20");
      txt.setAttribute("text-anchor", "start");
      txt.setAttribute("font-size", "14");
      txt.setAttribute("letter-spacing", "0");
    }

    const vb = svg.viewBox.baseVal;
    const bb = g.getBBox();
    // getBBox reports the box before the element's own transform, and zones
    // carry their cluster offset as a transform. Add it back or the callout
    // lands where the zone used to be.
    const bbx = bb.x + clusterDx(active ?? "");
    const x = Math.max(
      vb.x + 4,
      Math.min(vb.x + vb.width - width - 4, bbx + bb.width / 2 - width / 2),
    );
    let y = bb.y - (height + 4);
    if (y < vb.y + 4) y = bb.y + bb.height + 12;

    callout.setAttribute("transform", `translate(${x},${y})`);
    callout.style.opacity = "1";
  }, [active, soldSet, sponsors]);

  function zone(target: string) {
    const p = BY_TARGET[target];
    const isSold = soldSet.has(p.no);
    const sponsor = sponsors[p.no];
    const go = () => {
      if (sponsor?.url) {
        window.open(sponsor.url, "_blank", "noopener,noreferrer");
        return;
      }
      if (!isSold) window.location.href = buyHref(p.no, board.slug);
    };
    return {
      id: target,
      className: [
        "zone",
        isSold ? "sold" : "",
        sponsor?.logoUrl ? "sponsored" : "",
        active === target ? "on" : "",
      ]
        .filter(Boolean)
        .join(" "),
      tabIndex: 0,
      role: "button" as const,
      "aria-label": sponsor
        ? `${p.name}, sponsored by ${sponsor.brand}`
        : p.name,
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
      aria-label={`Technical drawing of a triathlon suit front and back, an aero helmet from the side and front, and a time trial frameset, with ${TOTAL_N} numbered sponsor positions marked in pink`}
    >
      {/* ---------- suit, front ---------- */}
      <g transform="translate(716.2,-17.8) scale(0.95)">
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
      <g transform="translate(916.2,-17.8) scale(0.95)">
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
      <g transform="translate(668,126.8) scale(0.85)">
        <path
          className="shape"
          d="M0 40 C2 6 30 -8 62 -8 C104 -8 128 8 138 28 C144 40 134 48 118 52 C86 60 44 62 22 60 C4 58 -1 52 0 40 Z"
        />
        <path className="hair" d="M18 -2 C42 40 78 52 126 50" />
      </g>

      {/* ---------- helmet, front ---------- */}
      <g transform="translate(668,256.8) scale(0.85)">
        <path
          className="shape"
          d="M45 -8 C74 -8 90 14 90 40 C90 60 74 68 45 68 C16 68 0 60 0 40 C0 14 16 -8 45 -8 Z"
        />
        <path className="hair" d="M8 34 C24 50 66 50 82 34 C80 56 66 64 45 64 C24 64 10 56 8 34 Z" />
      </g>

      {/* ---------- the bike ---------- */}
      <g transform="translate(10,-31.5) scale(0.85)">
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

      {/* ---------- labels ---------- */}
      <text className="tag" x="849.2" y="400" textAnchor="middle">
        FRONT
      </text>
      <text className="tag" x="1049.2" y="400" textAnchor="middle">
        BACK
      </text>
      <text className="tag" x="727.5" y="200" textAnchor="middle">
        HELMET / SIDE
      </text>
      <text className="tag" x="706.3" y="330" textAnchor="middle">
        HELMET / FRONT
      </text>

      {/* ---------- positions ---------- */}
      {ZONE_ORDER.map((target) => {
        const spec = ZONES[target];
        const sponsor = sponsors[BY_TARGET[target].no];
        return (
          <g
            key={target}
            transform={`translate(${clusterDx(target)},0)`}
            {...zone(target)}
          >
            {spec.plates.map((plate, i) => (
              <rect key={`p${i}`} className="plate" {...plate} />
            ))}
            {sponsor?.logoUrl
              ? spec.plates.map((plate, i) => {
                  const pad = Math.min(4, plate.height * 0.14);
                  return (
                    <image
                      key={`l${i}`}
                      className="logo"
                      href={sponsor.logoUrl as string}
                      x={plate.x + pad}
                      y={plate.y + pad}
                      width={plate.width - pad * 2}
                      height={plate.height - pad * 2}
                      transform={plate.transform}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  );
                })
              : spec.codes.map((c, i) => (
                  <text key={`c${i}`} className="code" x={c.x} y={c.y}>
                    {spec.code}
                  </text>
                ))}
          </g>
        );
      })}

      <g className="callout" ref={calloutRef} style={{ opacity: 0 }}>
        <rect ref={bgRef} className="cbg" x="0" y="0" width="200" height="30" rx="15" fill="var(--text)" />
        <rect
          ref={plateRef}
          className="cplate"
          rx="7"
          fill="#ffffff"
          style={{ display: "none" }}
        />
        <image
          ref={imgRef}
          className="clogo"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "none" }}
        />
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
        <text
          ref={urlRef}
          className="curl"
          x="0"
          y="0"
          textAnchor="middle"
          fontSize="12"
          style={{ display: "none" }}
        >
          .
        </text>
      </g>
    </svg>
  );
}
