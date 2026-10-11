import type { Metadata } from "next";
import { auth0, authConfigured } from "@/lib/auth0";

export const metadata: Metadata = { title: "Not authorised" };

export default async function NotAuthorizedPage() {
  if (!authConfigured) {
    return (
      <div className="text-center p-5">
        <h3>Admin login is not configured</h3>
        <p>Set the Auth0 environment variables to enable the admin pages.</p>
      </div>
    );
  }
  const session = await auth0.getSession();
  return (
    <div className="text-center p-5">
      <h3>Not authorised</h3>
      <p>
        {session?.user.email ? (
          <code>{session.user.email}</code>
        ) : (
          "This account"
        )}{" "}
        is not on the admin list.
      </p>
      <a className="btn btn-light" href="/auth/logout">
        Log out
      </a>
    </div>
  );
}
