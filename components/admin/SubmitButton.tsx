export default function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button className="btn btn-primary mb-2" type="submit" disabled={pending}>
      {pending ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-label="Saving"
        />
      ) : (
        children
      )}
    </button>
  );
}
