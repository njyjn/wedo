// Pure helpers, kept free of server-only imports so they can be unit tested.

export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminUser(
  user: { email?: string; email_verified?: boolean } | undefined,
  adminEmails: Set<string>,
): boolean {
  if (!user?.email || user.email_verified === false) return false;
  return adminEmails.has(user.email.toLowerCase());
}
