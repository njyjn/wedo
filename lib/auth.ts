import "server-only";
import { redirect } from "next/navigation";
import { auth0, authConfigured } from "@/lib/auth0";
import { isAdminUser, parseAdminEmails } from "@/lib/admin";

export async function getAdminStatus() {
  if (!authConfigured) return { user: undefined, isAdmin: false };
  const session = await auth0.getSession();
  const user = session?.user;
  return {
    user,
    isAdmin: isAdminUser(user, parseAdminEmails(process.env.ADMIN_EMAILS)),
  };
}

/**
 * Must be called at the top of every admin page, server action and route handler.
 * Layouts are not a security boundary in the App Router, so each entry point checks for itself.
 */
export async function requireAdmin(returnTo = "/god") {
  if (!authConfigured) redirect("/not-authorized");
  const { user, isAdmin } = await getAdminStatus();
  if (!user) redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (!isAdmin) redirect("/not-authorized");
  return user;
}
