"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { checkInGuests, type CheckinGuest } from "@/app/checkin/actions";

export default function CheckinCard({
  inviteCode,
  guests,
  coupleName,
  paymentQr,
}: {
  inviteCode: string;
  guests: CheckinGuest[];
  coupleName: string;
  paymentQr: string | null;
}) {
  const attending = guests.filter((g) => g.isAttending);
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(attending.filter((g) => g.checkedIn).map((g) => g.id)),
  );
  // null = not submitted yet; true/false = last submission's outcome
  const [success, setSuccess] = useState<boolean | null>(
    selected.size > 0 ? true : null,
  );
  const [isPending, startTransition] = useTransition();

  const toggle = (id: number) => {
    setSuccess(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () =>
    startTransition(async () => {
      try {
        const res = await checkInGuests({
          inviteCode,
          guestIds: [...selected],
        });
        setSuccess(res.ok);
      } catch {
        setSuccess(false);
      }
    });

  return (
    <div className="card text-center">
      <div className="card-body">
        <h5 className="card-title">Welcome!</h5>
        <p>Please find your table assignments below</p>
        {attending.length === 0 ? (
          <p className="text-muted">
            No guests on this invite have RSVP&apos;d as attending.
          </p>
        ) : (
          <div className="list-group pb-3">
            {attending.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`list-group-item list-group-item-action${selected.has(g.id) ? " active" : ""}`}
                aria-pressed={selected.has(g.id)}
                onClick={() => toggle(g.id)}
              >
                {g.salutation ? `${g.salutation} ` : ""}
                {g.firstName} {g.lastName} (Table {g.tableId ?? "not assigned"}){" "}
                {g.isCorsageRecipient ? "🌺" : ""}
              </button>
            ))}
          </div>
        )}
        <button
          className="btn btn-success"
          disabled={selected.size === 0 || isPending}
          onClick={submit}
        >
          {isPending ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-label="Loading"
            />
          ) : (
            `${success ? "✅ " : ""}Check In (${selected.size})`
          )}
        </button>
        {success === false && (
          <p className="mt-2 text-danger">
            Failed to check in! Please record it manually.
          </p>
        )}
      </div>
      {success && (
        <div className="card-body">
          <p>We hope you have a splendid time!</p>
          {paymentQr && (
            <>
              <p>Your blessings are greatly appreciated</p>
              <Image
                src={paymentQr}
                alt="Gift QR code"
                width={256}
                height={256}
                unoptimized
              />
            </>
          )}
          <p>With gratitude and love,</p>
          <h1 className="signature">{coupleName}</h1>
        </div>
      )}
    </div>
  );
}
