import BoardPage from "@/components/BoardPage";
import { MAIN } from "@/lib/boards";

/* Sold state lives in KV and is written by the Stripe webhook, so the
   page has to go and look. Thirty seconds is close enough to instant
   for a buyer and cheap enough to leave running. */
export const revalidate = 30;

export default function Page() {
  return <BoardPage board={MAIN} />;
}
