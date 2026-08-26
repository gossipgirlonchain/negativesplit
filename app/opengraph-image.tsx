import { ImageResponse } from "next/og";
import { SITE_NAME, TAKE_ALL, TOTAL_N } from "@/lib/positions";
import { money } from "@/lib/money";

export const alt = "Negative Split — your brand, on my Ironman journey.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Deliberately static: the numbers here are the goal and the size of the
   board, not live sold state. X caches an unfurl for a long time, and a
   stale "committed" figure would be a lie with a long half-life. */

const GRID = 40;
const LINE = "rgba(31,90,150,.10)";

export default function OpengraphImage() {
  const columns = Array.from({ length: Math.floor(size.width / GRID) }, (_, i) => i);
  const rows = Array.from({ length: Math.floor(size.height / GRID) }, (_, i) => i);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFCFD",
          color: "#0F1620",
          padding: 72,
          position: "relative",
        }}
      >
        {/* faint blue grid */}
        {columns.map((c) => (
          <div
            key={`c${c}`}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: c * GRID,
              width: 1,
              background: LINE,
            }}
          />
        ))}
        {rows.map((r) => (
          <div
            key={`r${r}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: r * GRID,
              height: 1,
              background: LINE,
            }}
          />
        ))}

        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 18, background: "#FF2D55" }} />
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Your brand, on my Ironman journey.
        </div>

        {/* the number */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 20, letterSpacing: 3, color: "#8FA0AE" }}>
              THE WHOLE BOARD
            </div>
            <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>
              {money(TAKE_ALL.price)}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              fontSize: 22,
              letterSpacing: 3,
              color: "#57646F",
              borderTop: "2px solid #FF2D55",
              paddingTop: 14,
            }}
          >
            {TOTAL_N} POSITIONS · KIT, HELMET, FRAMESET
          </div>
        </div>
      </div>
    ),
    size,
  );
}
