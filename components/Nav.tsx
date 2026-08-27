import type { Board } from "@/lib/boards";
import { SITE_NAME } from "@/lib/positions";

export default function Nav({ board }: { board: Board }) {
  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a className="mark" href={`${board.path}#top`}>
          <span className="dot" />
          <span>{SITE_NAME}</span>
        </a>
        <nav className="nav-links">
          <a href="#positions">Positions</a>
          <a href="#divided">How it&rsquo;s divided</a>
          <a href="#how">How it works</a>
          <a href="#race">The race</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="btn sm" href="#positions">
          Claim a position
        </a>
      </div>
    </header>
  );
}
