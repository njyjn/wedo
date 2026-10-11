"use client";

import HCaptcha from "@hcaptcha/react-hcaptcha";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Modal } from "react-bootstrap";
import { submitRsvp } from "@/app/rsvp/actions";
import { submissionFromChoices } from "@/lib/rsvp";

type FormGuest = { id: number; name: string; isAttending: boolean | null };

export default function RsvpForm({
  code,
  guests,
  recipientNotes,
  agreement,
  changePolicy,
}: {
  code: string;
  /** Admin-configured text guests must agree to; no checkbox when null. */
  agreement: React.ReactNode;
  changePolicy: React.ReactNode;
  guests: FormGuest[];
  recipientNotes: string;
}) {
  const [choices, setChoices] = useState<Map<number, boolean | null>>(
    () => new Map(guests.map((g) => [g.id, g.isAttending])),
  );
  const [notes, setNotes] = useState(recipientNotes);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: boolean; text: string } | null>(
    null,
  );
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  const choose = (id: number, attending: boolean) =>
    setChoices((prev) => new Map(prev).set(id, attending));

  const respond = () => {
    const submission = submissionFromChoices(
      guests.map((g) => ({ id: g.id, attending: choices.get(g.id) ?? null })),
    );
    if (!submission.ok) {
      setResult({ error: true, text: submission.error });
      return;
    }
    const { attending, guestIds } = submission;
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
          guestIds,
          recipientNotes: notes,
        });
        if (res.ok) {
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
          respond();
        }}
      >
        <HCaptcha size="invisible" ref={captchaRef} sitekey={siteKey} />
        <ul className="guest-list">
          {guests.map((g) => {
            const choice = choices.get(g.id) ?? null;
            return (
              <li className="guest-row" key={g.id}>
                <span className="guest-name">{g.name}</span>
                <div
                  className="choice-group"
                  role="radiogroup"
                  aria-label={`Response for ${g.name}`}
                >
                  {[
                    { value: true, label: "Accepts" },
                    { value: false, label: "Declines" },
                  ].map((o) => {
                    const id = `guest-${g.id}-${o.value ? "yes" : "no"}`;
                    return (
                      <span key={id}>
                        <input
                          type="radio"
                          className="btn-check"
                          name={`guest-${g.id}`}
                          id={id}
                          checked={choice === o.value}
                          onChange={() => choose(g.id, o.value)}
                        />
                        <label className="btn btn-choice" htmlFor={id}>
                          {o.label}
                        </label>
                      </span>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mb-3">
          <label className="form-label" htmlFor="rsvp-notes">
            A note for the couple <span className="text-muted">(optional)</span>
          </label>
          <textarea
            id="rsvp-notes"
            className="form-control"
            rows={3}
            maxLength={2000}
            placeholder="Dietary needs, well wishes, anything else"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {agreement && (
          <div className="mb-3">
            <div className="form-label">{agreement}</div>
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
        )}
        <div className="form-text mb-3">{changePolicy}</div>
        <div className="d-grid">
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send RSVP"}
          </button>
        </div>
      </form>
    </>
  );
}
