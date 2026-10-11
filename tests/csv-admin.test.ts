import { describe, expect, it } from "vitest";
import { isAdminUser, parseAdminEmails } from "@/lib/admin";
import { seatingChartCsv } from "@/lib/csv";
import { parseDatabaseUrl } from "@/lib/db-url";
import { auth0Domain, isAuth0Configured } from "@/lib/auth-config";

describe("admin allow-list", () => {
  const admins = parseAdminEmails(" Alex@Example.com, ,bride@example.com ");

  it("matches verified emails case-insensitively", () => {
    expect(
      isAdminUser({ email: "alex@example.com", email_verified: true }, admins),
    ).toBe(true);
    expect(isAdminUser({ email: "BRIDE@example.com" }, admins)).toBe(true);
  });

  it("rejects strangers, unverified emails and missing users", () => {
    expect(
      isAdminUser(
        { email: "someone@example.com", email_verified: true },
        admins,
      ),
    ).toBe(false);
    expect(
      isAdminUser({ email: "alex@example.com", email_verified: false }, admins),
    ).toBe(false);
    expect(isAdminUser(undefined, admins)).toBe(false);
  });

  it("lets nobody in when the list is empty", () => {
    expect(
      isAdminUser(
        { email: "alex@example.com", email_verified: true },
        parseAdminEmails(undefined),
      ),
    ).toBe(false);
  });
});

describe("seatingChartCsv", () => {
  it("lays tables out as columns of attending guests", () => {
    const csv = seatingChartCsv([
      {
        id: 2,
        isVip: false,
        guests: [
          {
            firstName: "Ann",
            lastName: "Lim",
            isChild: false,
            isAttending: true,
          },
        ],
      },
      {
        id: 1,
        isVip: true,
        guests: [
          {
            firstName: "Bob",
            lastName: "Ong",
            isChild: true,
            isAttending: true,
          },
          {
            firstName: "No",
            lastName: "Show",
            isChild: false,
            isAttending: false,
          },
          {
            firstName: "Cat",
            lastName: "Tan",
            isChild: false,
            isAttending: true,
          },
        ],
      },
    ]);
    expect(csv).toBe(
      ["2,1", "VIP 1,2", "Bob Ong (C),Ann Lim", "Cat Tan,", ""].join("\r\n"),
    );
  });

  it("quotes commas and neutralises spreadsheet formulas", () => {
    const csv = seatingChartCsv([
      {
        id: 1,
        isVip: false,
        guests: [
          {
            firstName: "=HYPERLINK(1)",
            lastName: "x, y",
            isChild: false,
            isAttending: true,
          },
        ],
      },
    ]);
    expect(csv.split("\r\n")[2]).toBe(`"'=HYPERLINK(1) x, y"`);
  });
});

describe("parseDatabaseUrl", () => {
  it("splits ?schema= out of the connection string", () => {
    expect(
      parseDatabaseUrl("postgresql://u:p@host/db?sslmode=require&schema=wedo"),
    ).toEqual({
      connectionString: "postgresql://u:p@host/db?sslmode=require",
      schema: "wedo",
    });
    expect(parseDatabaseUrl("postgresql://u:p@host/db")).toEqual({
      connectionString: "postgresql://u:p@host/db",
      schema: undefined,
    });
    expect(parseDatabaseUrl(undefined)).toEqual({});
  });
});

describe("Auth0 configuration", () => {
  const base = {
    AUTH0_CLIENT_ID: "id",
    AUTH0_CLIENT_SECRET: "s",
    AUTH0_SECRET: "x".repeat(64),
  };

  it("prefers AUTH0_DOMAIN and falls back to the v1 issuer URL", () => {
    expect(
      auth0Domain({
        AUTH0_DOMAIN: "a.auth0.com",
        AUTH0_ISSUER_BASE_URL: "https://b.auth0.com",
      }),
    ).toBe("a.auth0.com");
    expect(
      auth0Domain({ AUTH0_ISSUER_BASE_URL: "https://tenant.us.auth0.com/" }),
    ).toBe("tenant.us.auth0.com");
    expect(auth0Domain({ AUTH0_ISSUER_BASE_URL: "tenant.auth0.com" })).toBe(
      "tenant.auth0.com",
    );
    expect(auth0Domain({})).toBeUndefined();
  });

  it("needs a domain, client credentials and a secret", () => {
    expect(
      isAuth0Configured({
        ...base,
        AUTH0_ISSUER_BASE_URL: "https://t.auth0.com",
      }),
    ).toBe(true);
    expect(isAuth0Configured(base)).toBe(false);
    expect(
      isAuth0Configured({
        ...base,
        AUTH0_DOMAIN: "t.auth0.com",
        AUTH0_SECRET: "",
      }),
    ).toBe(false);
  });
});
