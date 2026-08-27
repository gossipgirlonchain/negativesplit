import type { Board } from "@/lib/boards";
import { SITE_NAME } from "@/lib/positions";

export default function Footer({ board }: { board: Board }) {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <div className="mark">
              <span className="dot" />
              <span>{SITE_NAME}</span>
            </div>
          </div>
          <div className="foot-links">
            <a href={`mailto:${board.contactEmail}`}>{board.contactEmail}</a>
            <a href={board.socialHref}>{board.socialLabel}</a>
            {board.uploads ? <a href="/sponsor">Send artwork</a> : null}
            <a href="#positions">Positions</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
        <p className="legal">
          Payments run through Stripe. Not affiliated with, endorsed by, or
          sponsored by Ironman, the World Triathlon Corporation, or any bike or
          apparel manufacturer. The drawings are generic illustrations of a time
          trial frameset and a tri suit, not any specific product. The bike does
          not exist yet. That is the point.
        </p>
      </div>
    </footer>
  );
}
