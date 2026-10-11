import type { Metadata } from "next";
import { auth0 } from "@/lib/auth0";

export const metadata: Metadata = { title: "Not authorised" };

export default async function NotAuthorizedPage() {
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
