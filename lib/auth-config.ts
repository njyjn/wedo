// Pure helpers, kept free of server-only imports so they can be unit tested.

type Env = Record<string, string | undefined>;

/**
 * The Auth0 tenant domain. Falls back to the v1 (SDK v1) `AUTH0_ISSUER_BASE_URL`, e.g.
 * "https://tenant.auth0.com/", so existing deployments keep working after the upgrade.
 */
export function auth0Domain(env: Env): string | undefined {
  if (env.AUTH0_DOMAIN) return env.AUTH0_DOMAIN;
  const issuer = env.AUTH0_ISSUER_BASE_URL;
  if (!issuer) return undefined;
  try {
    return (
      new URL(issuer.includes("://") ? issuer : `https://${issuer}`).host ||
      undefined
    );
  } catch {
    return undefined;
  }
}

/** Whether there is enough configuration to run Auth0 login at all. */
export function isAuth0Configured(env: Env): boolean {
  return Boolean(
    auth0Domain(env) &&
    env.AUTH0_CLIENT_ID &&
    env.AUTH0_CLIENT_SECRET &&
    env.AUTH0_SECRET,
  );
}
