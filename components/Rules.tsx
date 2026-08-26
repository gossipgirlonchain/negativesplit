import Reveal from "./Reveal";

const RULES = [
  {
    n: "RULE 01",
    title: "Front and back are separate brands",
    body: (
      <>
        The kit carries four large panels: two on the front, two on the back.
        Each one is its own position with its own logo. Nobody is buying a wrap
        that repeats the same mark front and back, because nobody ever sees both
        at once.
      </>
    ),
  },
  {
    n: "RULE 02",
    title: "On the frame, one buyer owns both sides",
    body: (
      <>
        Vinyl positions are never sold left or right. Buy the lower down tube and
        you get it drive side and non-drive, same logo on each. Splitting by side
        doubles the admin and halves what each half is worth, and the drive side
        is the one that gets photographed anyway.
      </>
    ),
  },
  {
    n: "RULE 03",
    title: "The kit closes early",
    body: (
      <>
        Kit panels have to be printed and shipped, so they close{" "}
        <b style={{ color: "var(--accent)" }}>October 24</b>. Frame and helmet are
        cut vinyl and stay open until race week. If you want the big panels you
        have six weeks, not fifteen.
      </>
    ),
  },
];

export default function Rules() {
  return (
    <section id="divided">
      <div className="wrap">
        <div className="sec-head">
          <h2>How it&rsquo;s divided.</h2>
          <p>Three rules, applied to every position on the board.</p>
        </div>
        <div className="trio">
          {RULES.map((rule, i) => (
            <Reveal key={rule.n} className="card" delay={i * 70}>
              <span className="rule-n">{rule.n}</span>
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
