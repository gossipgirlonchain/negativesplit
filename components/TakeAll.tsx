import Reveal from "./Reveal";
import { INVENTORY, TAKE_ALL, TOTAL_N, buyHref } from "@/lib/positions";
import { money } from "@/lib/money";

export default function TakeAll({ taken }: { taken: boolean }) {
  const href = buyHref(TAKE_ALL.no, `All ${TOTAL_N} positions`);

  return (
    <section className="tight">
      <div className="wrap">
        <Reveal className="card takeall" style={{ borderColor: "var(--accent-line)" }}>
          <div>
            <div className="eyebrow">One buyer · one only</div>
            <h2 style={{ marginTop: 12 }}>Take the whole thing.</h2>
            <p style={{ color: "var(--text2)", margin: "14px 0 0", maxWidth: "46ch" }}>
              Every position on the kit and the frame, art directed as one design
              instead of {TOTAL_N} logos competing. Ends the campaign on day one
              and hits the number exactly.
            </p>
            <ul>
              <li>All {TOTAL_N} positions, kit and frameset</li>
              <li>Sole naming rights. No other brand anywhere on me.</li>
            </ul>
          </div>
          <div className="price">
            <div className="caption" style={{ marginBottom: 10 }}>
              Flat
            </div>
            <div className="big">{money(TAKE_ALL.price)}</div>
            <div className="caption" style={{ margin: "8px 0 22px" }}>
              Individually {money(INVENTORY)}
            </div>
            {taken ? (
              <span className="btn grey">Taken</span>
            ) : (
              <a className="btn" href={href}>
                Take everything
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
