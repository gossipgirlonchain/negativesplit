import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PrivyClientProvider from "@/components/PrivyClientProvider";
import SponsorDashboard from "@/components/SponsorDashboard";
import { CONTACT_EMAIL } from "@/lib/positions";

export const metadata: Metadata = {
  title: "Send artwork",
  description: "Upload your logo for the position you bought.",
  robots: { index: false, follow: false },
};

export default function SponsorPage() {
  const appId = process.env.PRIVY_APP_ID;

  return (
    <>
      <Nav />
      <main id="top">
        <section className="tight">
          <div className="narrow">
            <div className="sec-head">
              <h2>Send artwork.</h2>
              <p>
                Sign in with the email you paid with, upload your logo and a
                link, and it goes on the board once it is approved.
              </p>
            </div>
            {appId ? (
              <PrivyClientProvider appId={appId}>
                <SponsorDashboard />
              </PrivyClientProvider>
            ) : (
              <div className="card panel">
                <h3>Sign in is not configured yet</h3>
                <p className="msg ok">
                  PRIVY_APP_ID is not set on this deployment. Email
                  your artwork to {CONTACT_EMAIL} and it gets handled by hand.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
