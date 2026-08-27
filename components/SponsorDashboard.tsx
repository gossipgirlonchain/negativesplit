"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { CONTACT_EMAIL } from "@/lib/positions";
import { money } from "@/lib/money";

type Artwork = {
  brand: string;
  url: string;
  logoUrl: string;
  status: "pending" | "approved" | "rejected";
  note: string;
} | null;

/** Prefilled email, for when the uploader will not play ball. */
function artworkMailto(positions: Owned[], one?: Owned): string {
  const list = one
    ? `No. ${one.no}, ${one.name}`
    : positions.map((p) => `No. ${p.no}, ${p.name}`).join("\n");
  const subject = one
    ? `Negative Split artwork - No. ${one.no}`
    : "Negative Split artwork";
  const body = `Hi Winny,\n\nArtwork attached for:\n${list}\n\nBrand:\nLink:\n\n`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

type Owned = {
  no: string;
  name: string;
  price: number;
  artwork: Artwork;
};

export default function SponsorDashboard() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const [positions, setPositions] = useState<Owned[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch("/api/sponsor/me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Could not load your positions. Try signing in again.");
      return;
    }
    const data = (await res.json()) as { positions: Owned[] };
    setPositions(data.positions);
  }, [getAccessToken]);

  useEffect(() => {
    if (authenticated) void load();
  }, [authenticated, load]);

  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="card panel">
        <h3>Sign in to send artwork</h3>
        <p className="msg ok">
          Use the same email you paid with. We match your sign in against the
          email on the Stripe receipt, so that is the one that will find your
          positions. If you paid on a company card with a different address,
          email {CONTACT_EMAIL} and it gets pointed at the right one.
        </p>
        <div style={{ marginTop: 18 }}>
          <button className="btn" onClick={() => login()}>
            Sign in with email
          </button>
        </div>
      </div>
    );
  }

  const email = user?.email?.address ?? "";

  return (
    <>
      <div className="card panel">
        <div className="head">
          <h3>Signed in</h3>
          <span className="label">{email}</span>
        </div>
        <p className="msg ok">
          SVG is best. PNG, JPG or WebP at 300dpi also work. Keep it under 2MB.
          Artwork is reviewed before it appears on the board. If the uploader
          will not take your file, email it to {CONTACT_EMAIL} and it gets done
          by hand.
        </p>
        <div style={{ marginTop: 16 }}>
          <button className="btn sm quiet" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </div>

      {error ? <p className="msg err">{error}</p> : null}

      {positions === null ? null : positions.length === 0 ? (
        <div className="card panel">
          <h3>Nothing under this email yet</h3>
          <p className="msg ok">
            No paid position is registered to {email}. If you have just paid,
            give it a minute. If you paid under another address, email{" "}
            {CONTACT_EMAIL} and it gets moved across.
          </p>
        </div>
      ) : (
        <>
          {positions.map((position) => (
            <ArtworkForm key={position.no} position={position} onSaved={load} />
          ))}

          <div className="card panel">
            <h3>Or just email it</h3>
            <p className="msg ok">
              If the uploader gives you any trouble, send the file to{" "}
              {CONTACT_EMAIL} and it gets put on the board by hand. SVG is best,
              or a PNG at 300dpi. Say which position it is for and include the
              link you want the logo to point at.
            </p>
            <div className="actions">
              <a className="btn" href={artworkMailto(positions)}>
                Email my artwork
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ArtworkForm({
  position,
  onSaved,
}: {
  position: Owned;
  onSaved: () => Promise<void>;
}) {
  const { getAccessToken } = usePrivy();
  const [brand, setBrand] = useState(position.artwork?.brand ?? "");
  const [url, setUrl] = useState(position.artwork?.url ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setFailed(false);

    const form = new FormData(e.currentTarget);
    form.set("position", position.no);
    form.set("brand", brand);
    form.set("url", url);

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/sponsor/artwork", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFailed(true);
        setMessage(data.error ?? "Upload failed.");
      } else {
        setMessage("Sent. It shows on the board once it is approved.");
        await onSaved();
      }
    } catch {
      setFailed(true);
      setMessage("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const artwork = position.artwork;

  return (
    <div className="card panel">
      <div className="head">
        <span className="label">No. {position.no}</span>
        <h3>{position.name}</h3>
        <span className="label">{money(position.price)}</span>
      </div>

      {artwork ? (
        <div className="preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artwork.logoUrl} alt="" />
          <div>
            <span className={`status ${artwork.status}`}>{artwork.status}</span>
            {artwork.note ? <p className="note">{artwork.note}</p> : null}
          </div>
        </div>
      ) : null}

      <form className="form" onSubmit={submit}>
        <div className="field">
          <label htmlFor={`brand-${position.no}`}>Brand name</label>
          <input
            id={`brand-${position.no}`}
            name="brand"
            type="text"
            value={brand}
            maxLength={60}
            required
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`url-${position.no}`}>Link</label>
          <input
            id={`url-${position.no}`}
            name="url"
            type="text"
            inputMode="url"
            placeholder="acme.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`logo-${position.no}`}>Logo file</label>
          <input
            id={`logo-${position.no}`}
            name="logo"
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp"
            required
          />
        </div>
        <div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Sending" : artwork ? "Replace artwork" : "Send artwork"}
          </button>
        </div>
      </form>

      {message ? (
        <p className={`msg ${failed ? "err" : "ok"}`}>
          {message}
          {failed ? (
            <>
              {" "}
              <a href={artworkMailto([position], position)} style={{ color: "var(--accent)" }}>
                Email it to {CONTACT_EMAIL} instead
              </a>{" "}
              and it goes on by hand.
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
