import Reveal from "./Reveal";
import { CONTACT_EMAIL } from "@/lib/positions";

const STEPS = [
  {
    n: "STEP 01",
    title: "Pick a position, pay",
    body: "Card checkout, instant. The position is marked sold on this page the moment it clears.",
  },
  {
    n: "STEP 02",
    title: "Send artwork",
    body: `Upload it after checkout, or email it to ${CONTACT_EMAIL}. Vector SVG or AI preferred, PNG at 300dpi accepted. Kit panels go to the printer as one file, so those close October 24. Frame positions I cut on outdoor vinyl and proof by photo before anything is applied.`,
  },
  {
    n: "STEP 03",
    title: "It races",
    body: "Roughly 1,400 training miles, one 70.3 in the desert on December 5, and every photo either of those produces.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{ background: "var(--bg2)" }}>
      <div className="wrap">
        <div className="sec-head">
          <h2>How it works.</h2>
          <p>Three steps. No calls, no deck, no invoice.</p>
        </div>
        <div className="trio">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} className="card" delay={i * 70}>
              <span className="step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
