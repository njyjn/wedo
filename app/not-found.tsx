import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center p-5">
      <h3>Not found</h3>
      <p>Please check your invite code, or contact your host for assistance.</p>
      <Link className="btn btn-light" href="/">
        Back to home
      </Link>
    </div>
  );
}
