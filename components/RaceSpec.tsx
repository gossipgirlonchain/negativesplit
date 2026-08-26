import Reveal from "./Reveal";

const SPEC: { dt: string; dd: string; accent?: boolean }[] = [
  { dt: "Race", dd: "Ironman 70.3 Indian Wells / La Quinta" },
  { dt: "Date", dd: "December 5, 2026" },
  { dt: "Distance", dd: "1.2 swim / 56 bike / 13.1 run" },
  { dt: "Then", dd: "Full Ironman, Q2 2027", accent: true },
  { dt: "Distance", dd: "2.4 swim / 112 bike / 26.2 run" },
  { dt: "Training miles before the 70.3", dd: "~1,400" },
];

export default function RaceSpec() {
  return (
    <section id="race">
      <div className="wrap">
        <div className="sec-head">
          <h2>The race.</h2>
          <p>What the money buys and where it goes.</p>
        </div>
        <Reveal
          className="card flat spec"
          style={{ maxWidth: 720, marginInline: "auto" }}
        >
          <dl style={{ margin: 0 }}>
            {SPEC.map((row, i) => (
              <div className="spec-row" key={`${row.dt}-${i}`}>
                <dt>{row.dt}</dt>
                <dd style={row.accent ? { color: "var(--accent)" } : undefined}>
                  {row.dd}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
