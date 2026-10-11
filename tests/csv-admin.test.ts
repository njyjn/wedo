import { describe, expect, it } from "vitest";
import { isAdminUser, parseAdminEmails } from "@/lib/admin";
import { seatingChartCsv } from "@/lib/csv";

describe("admin allow-list", () => {
  const admins = parseAdminEmails(" Justin@Example.com, ,bride@example.com ");

  it("matches verified emails case-insensitively", () => {
    expect(
      isAdminUser(
        { email: "justin@example.com", email_verified: true },
        admins,
      ),
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
      isAdminUser(
        { email: "justin@example.com", email_verified: false },
        admins,
      ),
    ).toBe(false);
    expect(isAdminUser(undefined, admins)).toBe(false);
  });

  it("lets nobody in when the list is empty", () => {
    expect(
      isAdminUser(
        { email: "justin@example.com", email_verified: true },
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
