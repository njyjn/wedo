/**
 * Prisma's CLI reads the Postgres schema from `?schema=` on DATABASE_URL, but the pg driver adapter
 * does not. Split it out so one URL works for both migrations and the app.
 */
export function parseDatabaseUrl(raw: string | undefined): {
  connectionString?: string;
  schema?: string;
} {
  if (!raw) return {};
  const url = new URL(raw);
  const schema = url.searchParams.get("schema") ?? undefined;
  url.searchParams.delete("schema");
  return { connectionString: url.toString(), schema };
}
