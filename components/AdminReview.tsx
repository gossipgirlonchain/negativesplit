"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { BY_NO } from "@/lib/positions";

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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [linkState, setLinkState] = useState("");

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
    const data = (await res.json()) as { records: Record_[] };
    setRecords(data.records);
  }, [getAccessToken]);

  useEffect(() => {
    if (authenticated) void load();
  }, [authenticated, load]);

  async function syncLinks() {
    setLinkState("Creating any missing links in Stripe...");
    const token = await getAccessToken();
    const res = await fetch("/api/admin/sync-links", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      error?: string;
      created?: string[];
      existing?: string[];
      total?: number;
    };
    if (!res.ok) {
      setLinkState(data.error ?? "Could not create links.");
      return;
    }
    const created = data.created?.length ?? 0;
    setLinkState(
      `${data.total} positions have a checkout link. ${created} created just now, ${data.existing?.length ?? 0} already existed.`,
    );
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
      <div className="card panel">
        <div className="head">
          <h3>Checkout links</h3>
        </div>
        <p className="msg ok">
          Creates the Stripe product, price and payment link for every position
          that does not have one. Safe to press twice: it reuses anything that
          already exists. Until this is done, Claim buttons fall back to email.
        </p>
        <div className="actions">
          <button className="btn sm" onClick={() => void syncLinks()}>
            Create payment links
          </button>
        </div>
        {linkState ? <p className="msg ok">{linkState}</p> : null}
      </div>

      {error ? <p className="msg err">{error}</p> : null}

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
