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
    <form action={formAction} className="lookup-form">
      <input
        name="code"
        className="form-control form-control-lg text-center text-uppercase"
        type="text"
        placeholder="Invite code"
        aria-label="Invite code"
        autoComplete="off"
        autoFocus={Boolean(prefilledCode)}
        required
        defaultValue={state.code ?? prefilledCode}
      />
      <button
        className="btn btn-primary btn-lg"
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
          "Find my invite"
        )}
      </button>
      {state.error && (
        <p className="text-danger lookup-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
