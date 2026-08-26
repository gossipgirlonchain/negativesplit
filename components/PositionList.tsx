"use client";

/* The board as a list. Hovering a row lights up its zone in the
   drawing, and vice versa, through the shared hover state. Every
   number here comes from lib/positions.ts. */

import { Fragment } from "react";
import Reveal from "./Reveal";
import { hoverHandlers, useHover } from "./HoverSync";
import { GROUPS, buyHref, type Position } from "@/lib/positions";
import type { PublicSponsor } from "@/lib/sponsors";
import { money } from "@/lib/money";

export default function PositionList({
  sold,
  sponsors,
  links,
}: {
  sold: string[];
  sponsors: Record<string, PublicSponsor>;
  links: Record<string, string>;
}) {
  const soldSet = new Set(sold);
  const { active, setActive } = useHover();

  return (
    <Reveal className="card list" id="list">
      {GROUPS.map((group) => {
        const openIn = group.items.filter((i) => !soldSet.has(i.no)).length;
        return (
          <Fragment key={group.title}>
            <div className="list-group">
              <h3>{group.title}</h3>
              <span className="caption">{group.note}</span>
              <span className="caption" style={{ marginLeft: 0 }}>
                {openIn} of {group.items.length} open
              </span>
            </div>
            {group.items.map((position) => (
              <Row
                key={position.no}
                position={position}
                isSold={soldSet.has(position.no)}
                sponsor={sponsors[position.no]}
                href={buyHref(position.no, position.name, links)}
                isActive={active === position.target}
                setActive={setActive}
              />
            ))}
          </Fragment>
        );
      })}
    </Reveal>
  );
}

function Row({
  position,
  isSold,
  sponsor,
  href,
  isActive,
  setActive,
}: {
  position: Position;
  isSold: boolean;
  sponsor?: PublicSponsor;
  href: string;
  isActive: boolean;
  setActive: (target: string | null) => void;
}) {

  return (
    <div
      className={["row", isSold ? "is-sold" : "", isActive ? "on" : ""]
        .filter(Boolean)
        .join(" ")}
      data-target={position.target}
      {...hoverHandlers(position.target, setActive)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) return;
        if (sponsor?.url) {
          window.open(sponsor.url, "_blank", "noopener,noreferrer");
          return;
        }
        if (isSold) return;
        window.location.href = href;
      }}
    >
      <div className="n">{position.no}</div>
      <div>
        <div className="nm">
          {position.name}
          {isSold ? (
            <span className="pill mute">Sold</span>
          ) : position.tag ? (
            <span className="pill">{position.tag}</span>
          ) : null}
        </div>
        <div className="sub">{position.sub}</div>
        {sponsor ? (
          <a
            className="sponsor"
            href={sponsor.url || undefined}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sponsor.logoUrl} alt="" />
            <span>{sponsor.brand}</span>
          </a>
        ) : null}
      </div>
      <div className="sz">{position.size}</div>
      <div className="pr">{money(position.price)}</div>
      <div>
        {sponsor?.url ? (
          <a
            className="btn sm quiet"
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Visit
          </a>
        ) : isSold ? (
          <span className="btn sm grey">Taken</span>
        ) : (
          <a className="btn sm quiet" href={href}>
            Claim
          </a>
        )}
      </div>
    </div>
  );
}
