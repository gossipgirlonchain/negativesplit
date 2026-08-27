import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import { HoverProvider } from "@/components/HoverSync";
import Nav from "@/components/Nav";
import PositionList from "@/components/PositionList";
import Progress from "@/components/Progress";
import RaceSpec from "@/components/RaceSpec";
import Rules from "@/components/Rules";
import Sheet from "@/components/Sheet";
import ThanksBanner from "@/components/ThanksBanner";
import type { Board } from "@/lib/boards";
import { openCount, raised } from "@/lib/positions";
import { getSold } from "@/lib/sold";
import { getApprovedSponsors } from "@/lib/sponsors";

/* One page, rendered per athlete. Everything is shared except the sold
   state, which is namespaced per board, and the contacts. data-board is
   what lets a board carry its own accent colour. */

export default async function BoardPage({ board }: { board: Board }) {
  const [sold, sponsors] = await Promise.all([
    getSold(board.slug),
    getApprovedSponsors(board.slug),
  ]);
  const soldList = [...sold];

  return (
    <div data-board={board.slug || "main"}>
      <Nav board={board} />
      <HoverProvider>
        <main id="top">
          <div className="wrap hero">
            <ThanksBanner board={board} />
            <Hero />
            <Sheet sold={soldList} sponsors={sponsors} board={board} />
          </div>

          <div className="wrap" id="positions">
            <Progress raised={raised(sold)} open={openCount(sold)} />
            <PositionList sold={soldList} sponsors={sponsors} board={board} />
          </div>

          <Rules />
          <HowItWorks board={board} />
          <RaceSpec />
          <Faq board={board} />
        </main>
      </HoverProvider>
      <Footer board={board} />
    </div>
  );
}
