import Drawing from "./Drawing";
import Reveal from "./Reveal";
import { TOTAL_N } from "@/lib/positions";
import type { PublicSponsor } from "@/lib/sponsors";

export default function Sheet({
  sold,
  sponsors,
}: {
  sold: string[];
  sponsors: Record<string, PublicSponsor>;
}) {
  return (
    <Reveal className="sheet">
      <div className="titleblock">
        <div>
          <span className="k">Sheet</span>
          <span className="v">01 / 01</span>
        </div>
        <div>
          <span className="k">Drawing</span>
          <span className="v">Sponsor position layout</span>
        </div>
        <div>
          <span className="k">Subject</span>
          <span className="v">Race kit &middot; Helmet &middot; Frameset</span>
        </div>
        <div>
          <span className="k">Scale</span>
          <span className="v">NTS</span>
        </div>
        <div>
          <span className="k">Positions</span>
          <span className="v">{TOTAL_N}</span>
        </div>
      </div>
      <div className="hero-scroll">
        <Drawing sold={sold} sponsors={sponsors} />
      </div>
    </Reveal>
  );
}
