"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/app/god/actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Submits a form to a server action without React's automatic form reset, so a validation
 * error doesn't wipe what the admin typed. Optionally clears the form after a success.
 */
export function useAdminForm(action: Action, { resetOnSuccess = true } = {}) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return { state, pending, formRef, onSubmit };
}
