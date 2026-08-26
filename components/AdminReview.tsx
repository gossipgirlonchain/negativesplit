"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { BY_NO } from "@/lib/positions";

type BoardEntry = { no: string; name: string; sold: boolean };

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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    const token = await getAccessToken();
    if (!token) return;
    const res = await fetch("/api/admin/submissions", {
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
    const data = (await res.json()) as { records: Record_[]; board: BoardEntry[] };
    setRecords(data.records);
    setBoard(data.board ?? []);
  }, [getAccessToken]);

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
      body: JSON.stringify({ position: no, decision, note }),
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
      body: JSON.stringify({ position: no, owner }),
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
          </div>
          {board.map((entry) => (
            <div className="board-row" key={entry.no}>
              <span className="label">{entry.no}</span>
              <span className="nm">{entry.name}</span>
              <span className={`status ${entry.sold ? "rejected" : "approved"}`}>
                {entry.sold ? "sold" : "available"}
              </span>
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
