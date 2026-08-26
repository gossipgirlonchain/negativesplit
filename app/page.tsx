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
import TakeAll from "@/components/TakeAll";
import ThanksBanner from "@/components/ThanksBanner";
import { POSITIONS, TAKE_ALL, openCount, raised } from "@/lib/positions";
import { getSold } from "@/lib/sold";
import { getApprovedSponsors } from "@/lib/sponsors";

/* Sold state lives in KV and is written by the Stripe webhook, so the
   page has to go and look. Thirty seconds is close enough to instant
   for a buyer and cheap enough to leave running. */
export const revalidate = 30;

export default async function Page() {
  const [sold, sponsors] = await Promise.all([
    getSold(),
    getApprovedSponsors(),
  ]);
  const soldList = [...sold];

  const takenAll =
    sold.has(TAKE_ALL.no) || POSITIONS.every((p) => sold.has(p.no));

  return (
    <>
      <Nav />
      <HoverProvider>
        <main id="top">
          <div className="wrap hero">
            <ThanksBanner />
            <Hero />
            <Sheet sold={soldList} sponsors={sponsors} />
          </div>

          <div className="wrap" id="positions">
            <Progress raised={raised(sold)} open={openCount(sold)} />
            <PositionList sold={soldList} sponsors={sponsors} />
          </div>

          <TakeAll taken={takenAll} />
          <Rules />
          <HowItWorks />
          <RaceSpec />
          <Faq />
        </main>
      </HoverProvider>
      <Footer />
    </>
  );
}
