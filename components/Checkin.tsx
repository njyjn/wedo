"use client";

import { useEffect, useState, useTransition } from "react";
import CheckinCard from "@/components/CheckinCard";
import { searchCheckin, type CheckinSearchResult } from "@/app/checkin/actions";

/** Pull the invite code out of a scanned RSVP link (https://host/rsvp/CODE), or accept a bare code. */
function codeFromScan(text: string): string | null {
  try {
    const match = new URL(text).pathname.match(/\/rsvp\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return /^[A-Za-z0-9]{1,32}$/.test(text.trim()) ? text.trim() : null;
  }
}

export default function Checkin({
  coupleName,
  paymentQr,
}: {
  coupleName: string;
  paymentQr: string | null;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CheckinSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const search = (q: string) => {
    if (!q.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await searchCheckin(q);
        setResult(res);
        if (res.kind === "notFound")
          setError(
            "No invite or guest found. Please check-in directly with a host",
          );
      } catch {
        setError("Search failed. Please try again.");
      }
    });
  };

  const showingInvite = result?.kind === "invite";

  useEffect(() => {
    if (showingInvite) return;
    let cancelled = false;
    let scanner: { clear(): Promise<void> } | undefined;
    // html5-qrcode touches window on import, so load it only in the browser.
    import("html5-qrcode").then(
      ({ Html5QrcodeScanner, Html5QrcodeScanType }) => {
        if (cancelled) return;
        const s = new Html5QrcodeScanner(
          "qrscanner",
          {
            fps: 10,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          false,
        );
        s.render(
          (decoded) => {
            const code = codeFromScan(decoded);
            if (!code) {
              setError("That QR code is not an invite.");
              return;
            }
            setQuery(code.toUpperCase());
            search(code);
          },
          () => {},
        );
        scanner = s;
      },
    );
    return () => {
      cancelled = true;
      scanner?.clear().catch(() => {});
    };
  }, [showingInvite]);

  if (result?.kind === "invite") {
    return (
      <div className="main d-grid gap-3">
        <CheckinCard
          key={result.inviteCode}
          inviteCode={result.inviteCode}
          guests={result.guests}
          coupleName={coupleName}
          paymentQr={paymentQr}
        />
        <button
          className="btn btn-light"
          onClick={() => {
            setResult(null);
            setQuery("");
            setError(null);
          }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="card border-0 text-center align-items-center">
        <h1 className="signature">{coupleName}</h1>
        <h5>Welcome!</h5>
        <div className="card-body w-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
          >
            <div className="mb-3">
              <input
                type="text"
                className="form-control text-center"
                placeholder="Enter invite code or name"
                aria-label="Invite code or name"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
              />
              <div className="form-text">
                Please approach the host if you need assistance
              </div>
            </div>
            {result?.kind === "suggestions" && (
              <p>
                {result.guests.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                      setQuery(g.inviteCode);
                      search(g.inviteCode);
                    }}
                  >
                    {g.name}
                  </button>
                ))}
              </p>
            )}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-label="Loading"
                />
              ) : (
                "Search"
              )}
            </button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </form>
          <p className="mt-3 mb-1">Scan QR code</p>
          <div id="qrscanner" />
        </div>
      </div>
    </div>
  );
}
