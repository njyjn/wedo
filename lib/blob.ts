// Vercel Blob credentials: either a read-write token, or (for stores connected to the project in
// the dashboard) BLOB_STORE_ID plus the deployment's built-in Vercel OIDC token.
export function isBlobConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID);
}
