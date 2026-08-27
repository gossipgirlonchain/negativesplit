import { CHEAPEST } from "@/lib/positions";
import { money } from "@/lib/money";

export default function Faq() {
  return (
    <section id="faq" style={{ background: "var(--bg2)" }}>
      <div className="narrow">
        <div className="sec-head">
          <h2>Questions.</h2>
        </div>

        <details open>
          <summary>Why is every frame position sold as both sides?</summary>
          <div className="ans">
            <p>
              Half a down tube is not a sponsorship, it is a fragment. Splitting
              left and right would give me twice as many things to sell, each
              worth less than half of the whole, and every buyer would be annoyed
              the other one got the drive side. So the frame works the opposite
              way from the kit: one buyer, one logo, both sides.
            </p>
          </div>
        </details>

        <details>
          <summary>What do I actually get?</summary>
          <div className="ans">
            <p>
              Your logo in your position from application through race day. A
              proof before anything is final. A photo of your position in the
              wild mid-training. Race day photos. And a line in the post-race
              write-up to about 29,000 people.
            </p>
            <p>
              Kit panels are printed into the suit. Frame and helmet are cut
              outdoor vinyl, applied by me.
            </p>
          </div>
        </details>

        <details>
          <summary>
            Why isn&rsquo;t the top tube, or the wheels, or the seat post for
            sale?
          </summary>
          <div className="ans">
            <p>
              The top tube on most tri bikes is about 3cm tall, and a logo cut to
              3cm reads as a smudge from more than a metre away. Same for the
              aero bar extensions: narrow, curved, and covered by my forearms for
              56 miles. I would rather not sell you something that photographs
              badly.
            </p>
            <p>
              The wheels are off the board because I do not yet know what wheels
              I will end up with, and I am not selling space on a thing that does
              not exist.
            </p>
          </div>
        </details>

        <details>
          <summary>What is the October 24 deadline about?</summary>
          <div className="ans">
            <p>
              Custom tri kit takes about four weeks from final artwork to a suit
              in my hands, and I want it early enough to train in and confirm
              nothing chafes. So the kit panels close October 24 and the printer
              gets one file. Frame and helmet have no such constraint.
            </p>
          </div>
        </details>

        <details>
          <summary>What if it peels, or it rains, or I hate the placement?</summary>
          <div className="ans">
            <p>
              Vinyl gets re-cut and reapplied, free, as many times as it takes. If
              you hate the proof, I redo it before it goes on. Kit is printed
              once, so kit proofs get signed off by you in writing before the file
              ships.
            </p>
          </div>
        </details>

        <details>
          <summary>Who can&rsquo;t buy?</summary>
          <div className="ans">
            <p>
              No gambling, no adult, no MLM, no supplements making medical claims,
              and nothing with a token I would have to write a disclaimer for. I
              have been in crypto for eight years, so crypto itself is fine. The
              test is simple: if I would not post it from my own account, it does
              not go on my body or my bike.
            </p>
            <p>
              I reserve the right to refuse and refund anything, and I will tell
              you why.
            </p>
          </div>
        </details>

        <details>
          <summary>Can I buy more than one?</summary>
          <div className="ans">
            <p>
              Yes. Buy them one at a time, as many as you want. Nothing stops
              one brand taking several, and the cheapest way in is{" "}
              {money(CHEAPEST)}.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
