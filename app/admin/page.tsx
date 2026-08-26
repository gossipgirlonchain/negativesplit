import type { Metadata } from "next";
import AdminReview from "@/components/AdminReview";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PrivyClientProvider from "@/components/PrivyClientProvider";

export const metadata: Metadata = {
  title: "Review artwork",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <>
      <Nav />
      <main id="top">
        <section className="tight">
          <div className="narrow">
            <div className="sec-head">
              <h2>Review artwork.</h2>
              <p>Nothing reaches the board until it is approved here.</p>
            </div>
            {appId ? (
              <PrivyClientProvider appId={appId}>
                <AdminReview />
              </PrivyClientProvider>
            ) : (
              <div className="card panel">
                <h3>Sign in is not configured</h3>
                <p className="msg ok">Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
