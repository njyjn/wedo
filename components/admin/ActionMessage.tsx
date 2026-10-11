import type { ActionState } from "@/app/god/actions";

export default function ActionMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <div
      className={`col-12 small ${state.ok === undefined ? "text-muted" : state.ok ? "text-success" : "text-danger"}`}
      role="status"
    >
      {state.message}
    </div>
  );
}
