"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Modal } from "react-bootstrap";
import { submitRsvp } from "@/app/rsvp/actions";
import { AgreementLabel, ChangePolicy } from "@/content/rsvp";

type FormGuest = { id: number; name: string; isAttending: boolean | null };

export default function RsvpForm({
  code,
  guests,
  recipientNotes,
}: {
  code: string;
  guests: FormGuest[];
  recipientNotes: string;
}) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(guests.filter((g) => g.isAttending).map((g) => g.id)),
  );
  const [notes, setNotes] = useState(recipientNotes);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: boolean; text: string } | null>(
    null,
  );
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const respond = (attending: boolean) => {
    if (attending && selected.size === 0) {
      setResult({
        error: true,
        text: 'Please indicate which guests are attending. If not, select "Unable to Attend".',
      });
      return;
    }
    startTransition(async () => {
      let captcha: string;
      try {
        captcha = (await captchaRef.current!.execute({ async: true })).response;
      } catch (error) {
        console.warn("hCaptcha did not complete", error);
        setResult({
          error: true,
          text: "Please submit again with the captcha.",
        });
        return;
      }
      try {
        const res = await submitRsvp({
          code,
          captcha,
          attending,
          guestIds: attending ? [...selected] : [],
          recipientNotes: notes,
        });
        if (res.ok) {
          if (!attending) setSelected(new Set());
          setResult({
            error: false,
            text: attending
              ? "Thanks for your response. See you there!"
              : "Thank you for letting us know. We'll catch up another time!",
          });
        } else {
          setResult({ error: true, text: res.error });
        }
      } catch {
        setResult({
          error: true,
          text: "Something went wrong, please contact your host for assistance.",
        });
      } finally {
        captchaRef.current?.resetCaptcha();
      }
    });
  };

  return (
    <>
      <Modal
        show={result !== null}
        onHide={() => setResult(null)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{result?.error ? "Oops!" : "All set!"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{result?.text}</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setResult(null)}>
            Edit response
          </button>
          {!result?.error && (
            <Link className="btn btn-primary" href="/">
              Go to homepage
            </Link>
          )}
        </Modal.Footer>
      </Modal>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          respond(true);
        }}
      >
        <HCaptcha size="invisible" ref={captchaRef} sitekey={siteKey} />
        <fieldset className="mb-3">
          <legend className="form-label fs-6">
            Attending ({selected.size})
          </legend>
          {guests.map((g) => (
            <div className="form-check" key={g.id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`guest-${g.id}`}
                checked={selected.has(g.id)}
                onChange={() => toggle(g.id)}
              />
              <label className="form-check-label" htmlFor={`guest-${g.id}`}>
                {g.name}
              </label>
            </div>
          ))}
        </fieldset>
        <div className="mb-3">
          <label className="form-label" htmlFor="rsvp-notes">
            Message to the couple
          </label>
          <textarea
            id="rsvp-notes"
            className="form-control"
            rows={3}
            maxLength={2000}
            placeholder="Enter message (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <p className="form-label">
            <AgreementLabel />
          </p>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rsvp-agree"
              required
            />
            <label className="form-check-label" htmlFor="rsvp-agree">
              Agree
            </label>
          </div>
        </div>
        <p className="form-text">
          <ChangePolicy />
        </p>
        <div className="d-grid gap-2">
          <button
            className="btn btn-success"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Please wait..." : "Attending"}
          </button>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => respond(false)}
            hidden={isPending}
          >
            Unable to Attend
          </button>
        </div>
      </form>
    </>
  );
}
