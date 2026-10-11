"use client";

import { useActionState } from "react";
import { openInvite, type LookupState } from "@/app/rsvp/actions";

export default function RsvpLookupForm({
  prefilledCode,
}: {
  prefilledCode?: string;
}) {
  const [state, formAction, isPending] = useActionState<LookupState, FormData>(
    openInvite,
    {},
  );
  return (
    <form action={formAction}>
      <div className="mb-3">
        <input
          name="code"
          className="form-control text-center text-uppercase"
          type="text"
          placeholder="Enter invite code"
          aria-label="Invite code"
          autoComplete="off"
          autoFocus
          required
          defaultValue={state.code ?? prefilledCode}
        />
      </div>
      {state.error && <p className="text-danger">{state.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {isPending ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-label="Loading"
          />
        ) : (
          "RSVP"
        )}
      </button>
    </form>
  );
}
