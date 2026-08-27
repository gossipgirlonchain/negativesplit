import type { Metadata } from "next";
import BoardPage from "@/components/BoardPage";
import { CONNOR } from "@/lib/boards";

export const revalidate = 30;

export const metadata: Metadata = {
  title: CONNOR.title,
  description: "Your brand, on my Ironman journey.",
  alternates: { canonical: CONNOR.path },
};

export default function ConnorPage() {
  return <BoardPage board={CONNOR} />;
}
