"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { BY_NO } from "@/lib/positions";
import { BOARDS } from "@/lib/boards";

type Unmatched = {
  session: string;
  email: string;
  brand: string;
  contact: string;
  amount: number;
  currency: string;
  at: string;
  reason: string;
  candidates: { no: string; name: string }[];
};

type Sale = {
  email: string;
  brand: string;
  contact: string;
  amount: number;
  currency: string;
  session: string;
  at: string;
};

type BoardEntry = {
  no: string;
  name: string;
  sold: boolean;
  sale: Sale | null;
  onBoard: string;
};

type Record_ = {
  no: string;
  brand: string;
  url: string;
  logoUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  note: string;
};

export default function AdminReview() {
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  const [records, setRecords] = useState<Record_[] | null>(null);
  const [board, setBoard] = useState<BoardEntry[]>([]);
  const [unmatched, setUnmatched] = useState<Unmatched[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [slug, setSlug] = useState("");

  const load = useCallback(async () => {
    setError("");
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch(`/api/admin/submissions?board=${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 403) {
      setError("That email is not on the admin list.");
      setRecords([]);
      return;
    }
    if (!res.ok) {
      setError("Could not load submissions.");
      return;
    }
    const data = (await res.json()) as {
      records: Record_[];
      board: BoardEntry[];
      unmatched: Unmatched[];
    };
    setRecords(data.records);
    setBoard(data.board ?? []);
    setUnmatched(data.unmatched ?? []);
  }, [getAccessToken, slug]);

  useEffect(() => {
    if (authenticated) void load();
  }, [authenticated, load]);

  async function testCheckout() {
    setBusy("test");
    const token = await getAccessToken();
    const res = await fetch("/api/admin/test-checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position: "11" }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    setBusy("");
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error ?? "Could not start the test checkout.");
    }
  }

  async function repairBoard() {
    if (
      !window.confirm(
        "Put back on sale any position that has no payment or manual sale behind it? Real sales are untouched.",
      )
    ) {
      return;
    }
    setBusy("repair");
    const token = await getAccessToken();
    const res = await fetch("/api/admin/position", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "repair", board: slug }),
    });
    const data = (await res.json()) as { removed?: string[]; error?: string };
    setBusy("");
    if (!res.ok) {
      setError(data.error ?? "Repair failed.");
      return;
    }
    setError(
      data.removed?.length
        ? `Put back on sale: ${data.removed.join(", ")}`
        : "Nothing to repair. Every sold position has a sale behind it.",
    );
    await load();
  }

  async function attachPayment(payment: Unmatched, preset?: string) {
    const no =
      preset ??
      window.prompt(
        `Which position did ${payment.brand || payment.email || "this buyer"} pay for? Enter its number.`,
      );
    if (!no?.trim()) return;
    setBusy(payment.session);
    const token = await getAccessToken();
    const res = await fetch("/api/admin/position", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: slug,
        position: no.trim(),
        action: "sell",
        email: payment.email,
        session: payment.session,
      }),
    });
    setBusy("");
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Could not attach that payment.");
      return;
    }
    await load();
  }

  async function nameOnBoard(entry: BoardEntry) {
    setBusy(entry.no);
    const token = await getAccessToken();
    if (entry.onBoard) {
      await fetch("/api/admin/position", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: entry.no, action: "hide-name" }),
      });
    } else {
      const brand = window.prompt(
        `Name to show on the board for No. ${entry.no}. This goes public.`,
        entry.sale?.brand ?? "",
      );
      if (!brand?.trim()) {
        setBusy("");
        return;
      }
      const url = window.prompt("Link for that name? Leave blank for none.", "") ?? "";
      await fetch("/api/admin/position", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          board: slug,
          position: entry.no,
          action: "publish-name",
          brand,
          url,
        }),
      });
    }
    setBusy("");
    await load();
  }

  async function setBoardState(no: string, action: "sell" | "release") {
    if (action === "sell") {
      const email = window.prompt(
        `Which email should own No. ${no}? Sign in at /sponsor with this address to upload artwork.`,
      );
      if (!email?.trim()) return;
      setBusy(no);
      const token = await getAccessToken();
      await fetch("/api/admin/position", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: no, action: "sell", email }),
      });
    } else {
      if (!window.confirm(`Put No. ${no} back on the board and delete its artwork?`)) return;
      setBusy(no);
      const token = await getAccessToken();
      await fetch("/api/admin/position", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ position: no, action: "release" }),
      });
    }
    setBusy("");
    await load();
  }

  async function review(no: string, decision: "approve" | "reject") {
    const note =
      decision === "reject"
        ? window.prompt("Why? The sponsor sees this.") ?? ""
        : "";
    setBusy(no);
    const token = await getAccessToken();
    await fetch("/api/admin/review", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position: no, decision, note, board: slug }),
    });
    setBusy("");
    await load();
  }

  async function rebind(no: string) {
    const owner = window.prompt(`Which email owns No. ${no}?`) ?? "";
    if (!owner.trim()) return;
    setBusy(no);
    const token = await getAccessToken();
    await fetch("/api/admin/review", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position: no, owner, board: slug }),
    });
    setBusy("");
    await load();
  }

  if (!ready) return null;

  if (!authenticated) {
    return (
      <div className="card panel">
        <h3>Sign in</h3>
        <p className="msg ok">Use an email on the ADMIN_EMAILS list.</p>
        <div style={{ marginTop: 18 }}>
          <button className="btn" onClick={() => login()}>
            Sign in with email
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {error ? <p className="msg err">{error}</p> : null}

      {unmatched.length ? (
        <div className="card panel" style={{ borderColor: "var(--accent-line)" }}>
          <div className="head">
            <h3>Paid, but not on the board</h3>
            <span className="status rejected">{unmatched.length}</span>
          </div>
          <p className="msg ok">
            These cleared in Stripe without saying which position they were
            for, so nothing was marked sold. That happens when the payment did
            not come from a Claim button on the site. Attach each one to a
            position and it behaves like any other sale.
          </p>
          {unmatched.map((payment) => (
            <div className="board-row" key={payment.session}>
              <span className="label">
                {(payment.amount / 100).toLocaleString("en-US", {
                  style: "currency",
                  currency: (payment.currency || "usd").toUpperCase(),
                })}
              </span>
              <span className="nm">
                {payment.brand || payment.email || "unknown buyer"}
                {payment.contact ? ` · ${payment.contact}` : ""}
              </span>
              <span className="label">
                {new Date(payment.at).toLocaleDateString()}
              </span>
              <button
                className="btn sm quiet"
                disabled={busy === payment.session}
                onClick={() => void attachPayment(payment)}
              >
                Attach to...
              </button>
              {payment.candidates.length ? (
                <div className="candidates">
                  <span className="label">
                    {payment.candidates.length === 1
                      ? "only this position costs that"
                      : "positions at that price, still open"}
                  </span>
                  {payment.candidates.map((c) => (
                    <button
                      key={c.no}
                      className="btn sm"
                      disabled={busy === payment.session}
                      onClick={() => void attachPayment(payment, c.no)}
                    >
                      {c.no} · {c.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="candidates">
                  <span className="label">
                    no open position costs that. Check the amount against a
                    part payment or a discount.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {board.length ? (
        <div className="card panel">
          <div className="head">
            <h3>The board</h3>
          </div>
          <p className="msg ok">
            Take a position off the board without Stripe, for a bank transfer, a
            trade, or to test the artwork flow. Marking it sold assigns it to an
            email, and that address can then sign in at /sponsor and upload.
          </p>
          <div className="actions" style={{ marginTop: 0, marginBottom: 4 }}>
            <button
              className="btn sm quiet"
              disabled={busy === "test"}
              onClick={() => void testCheckout()}
            >
              $1 test checkout on No. 11
            </button>
            <button
              className="btn sm quiet"
              disabled={busy === "repair"}
              onClick={() => void repairBoard()}
            >
              Repair sold list
            </button>
          </div>
          {board.map((entry) => (
            <div key={entry.no}>
              <div className="board-row">
                <span className="label">{entry.no}</span>
                <span className="nm">{entry.name}</span>
                <span className={`status ${entry.sold ? "rejected" : "approved"}`}>
                  {entry.sold ? "sold" : "available"}
                </span>
                {entry.sold ? (
                  <button
                    className="btn sm quiet"
                    disabled={busy === entry.no}
                    onClick={() => void nameOnBoard(entry)}
                  >
                    {entry.onBoard ? "Hide name" : "Show name"}
                  </button>
                ) : null}
                <button
                  className="btn sm quiet"
                  disabled={busy === entry.no}
                  onClick={() =>
                    void setBoardState(entry.no, entry.sold ? "release" : "sell")
                  }
                >
                  {entry.sold ? "Release" : "Mark sold"}
                </button>
              </div>
              {entry.sale ? <SaleDetail sale={entry.sale} /> : null}
            </div>
          ))}
        </div>
      ) : null}

      {records === null ? null : records.length === 0 ? (
        <div className="card panel">
          <h3>Nothing submitted yet</h3>
        </div>
      ) : (
        records.map((record) => (
          <div className="card panel" key={record.no}>
            <div className="head">
              <span className="label">No. {record.no}</span>
              <h3>{BY_NO[record.no]?.name ?? record.no}</h3>
              <span className={`status ${record.status}`}>{record.status}</span>
            </div>

            <div className="preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={record.logoUrl} alt="" />
              <div>
                <div className="nm">{record.brand}</div>
                {record.url ? (
                  <a
                    className="note"
                    href={record.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {record.url}
                  </a>
                ) : (
                  <p className="note">No link given</p>
                )}
              </div>
            </div>

            {record.note ? <p className="note">Note: {record.note}</p> : null}

            <div className="actions">
              <button
                className="btn sm"
                disabled={busy === record.no || record.status === "approved"}
                onClick={() => void review(record.no, "approve")}
              >
                Approve
              </button>
              <button
                className="btn sm quiet"
                disabled={busy === record.no}
                onClick={() => void review(record.no, "reject")}
              >
                Reject
              </button>
              <button
                className="btn sm quiet"
                disabled={busy === record.no}
                onClick={() => void rebind(record.no)}
              >
                Reassign owner
              </button>
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: 18 }}>
        <button className="btn sm quiet" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    </>
  );
}

/** The receipt behind a sold position, so chasing artwork and answering
 *  "who marked this sold" never needs a database console. */
function SaleDetail({ sale }: { sale: Sale }) {
  const manual = sale.session === "manual";
  const paid = manual
    ? "marked by hand, no payment"
    : `${(sale.amount / 100).toLocaleString("en-US", {
        style: "currency",
        currency: (sale.currency || "usd").toUpperCase(),
      })} via Stripe`;

  return (
    <dl className="sale">
      <div>
        <dt>Source</dt>
        <dd>{paid}</dd>
      </div>
      {sale.brand ? (
        <div>
          <dt>Brand</dt>
          <dd>{sale.brand}</dd>
        </div>
      ) : null}
      {sale.contact ? (
        <div>
          <dt>Contact</dt>
          <dd>{sale.contact}</dd>
        </div>
      ) : null}
      {sale.email ? (
        <div>
          <dt>Email</dt>
          <dd>{sale.email}</dd>
        </div>
      ) : null}
      {sale.at ? (
        <div>
          <dt>When</dt>
          <dd>{new Date(sale.at).toLocaleString()}</dd>
        </div>
      ) : null}
      {!manual && sale.session ? (
        <div>
          <dt>Session</dt>
          <dd>{sale.session}</dd>
        </div>
      ) : null}
    </dl>
  );
}
