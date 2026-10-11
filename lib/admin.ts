// Pure helpers, kept free of server-only imports so they can be unit tested.

export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Who counts as an admin.
 * - No allow-list: anyone who can log in through the Auth0 application. Access is controlled in
 *   Auth0 (disable sign-ups on the connection so only accounts you create can log in).
 * - Allow-list set: only those verified emails.
 */
export function isAdminUser(
  user: { email?: string; email_verified?: boolean } | undefined,
  adminEmails: Set<string>,
): boolean {
  if (!user) return false;
  if (adminEmails.size === 0) return true;
  if (!user.email || user.email_verified === false) return false;
  return adminEmails.has(user.email.toLowerCase());
}
