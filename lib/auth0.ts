import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { auth0Domain, isAuth0Configured } from "@/lib/auth-config";

// Without Auth0 configured, guest pages still work; admin routes are refused (see proxy.ts, lib/auth.ts).
export const authConfigured = isAuth0Configured(process.env);

// Reads AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET and APP_BASE_URL from the environment.
// APP_BASE_URL may be omitted on Vercel previews; it is then inferred from the request host.
export const auth0 = new Auth0Client({ domain: auth0Domain(process.env) });
