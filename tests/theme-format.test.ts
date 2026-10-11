import { describe, expect, it } from "vitest";
import {
  calendarDaysUntil,
  countdownLabel,
  fromDateTimeLocalInput,
  toDateTimeLocalInput,
} from "@/lib/format";
import { submissionFromChoices } from "@/lib/rsvp";
import { DEFAULT_THEME, resolveAccent, resolveTheme } from "@/lib/theme";

describe("resolveTheme", () => {
  it("accepts known presets case-insensitively", () => {
    expect(resolveTheme(" Garden ")).toBe("garden");
  });

  it("falls back to the default for anything else", () => {
    expect(resolveTheme("")).toBe(DEFAULT_THEME);
    expect(resolveTheme("neon")).toBe(DEFAULT_THEME);
  });
});

describe("resolveAccent", () => {
  it("accepts 3- and 6-digit hex colours", () => {
    expect(resolveAccent("#ABC")).toBe("#abc");
    expect(resolveAccent(" #8a6a3f ")).toBe("#8a6a3f");
  });

  it("rejects anything that could escape a style attribute", () => {
    for (const v of ["", "red", "#12345", "#123456;color:red", "url(x)"]) {
      expect(resolveAccent(v)).toBeNull();
    }
  });
});

describe("calendarDaysUntil", () => {
  const tz = "Asia/Singapore";

  it("counts calendar days in the event time zone", () => {
    // 23:30 on 1 Aug in Singapore to 00:30 on 2 Aug in Singapore is one calendar day.
    expect(
      calendarDaysUntil(
        new Date("2027-08-01T16:30:00Z"),
        tz,
        new Date("2027-08-01T15:30:00Z"),
      ),
    ).toBe(1);
  });

  it("is zero on the day and negative afterwards", () => {
    const event = new Date("2027-08-20T10:30:00Z");
    expect(calendarDaysUntil(event, tz, new Date("2027-08-20T01:00:00Z"))).toBe(
      0,
    );
    expect(calendarDaysUntil(event, tz, new Date("2027-08-22T01:00:00Z"))).toBe(
      -2,
    );
  });
});

describe("countdownLabel", () => {
  it("describes the days left", () => {
    expect(countdownLabel(42)).toBe("42 days to go");
    expect(countdownLabel(1)).toBe("Tomorrow");
    expect(countdownLabel(0)).toBe("Today");
    expect(countdownLabel(-1)).toBeNull();
  });
});

describe("submissionFromChoices", () => {
  it("needs an answer for every guest", () => {
    expect(
      submissionFromChoices([
        { id: 1, attending: true },
        { id: 2, attending: null },
      ]).ok,
    ).toBe(false);
  });

  it("submits the accepted guests", () => {
    expect(
      submissionFromChoices([
        { id: 1, attending: true },
        { id: 2, attending: false },
      ]),
    ).toEqual({ ok: true, attending: true, guestIds: [1] });
  });

  it("treats declining for everyone as not attending", () => {
    expect(
      submissionFromChoices([
        { id: 1, attending: false },
        { id: 2, attending: false },
      ]),
    ).toEqual({ ok: true, attending: false, guestIds: [] });
  });
});

describe("datetime-local inputs", () => {
  it("round-trips wall-clock time in the event time zone", () => {
    const d = fromDateTimeLocalInput("2027-08-20T18:30", "Asia/Singapore");
    expect(d?.toISOString()).toBe("2027-08-20T10:30:00.000Z");
    expect(toDateTimeLocalInput(d!, "Asia/Singapore")).toBe("2027-08-20T18:30");
  });

  it("handles daylight saving time", () => {
    expect(
      fromDateTimeLocalInput(
        "2027-07-01T12:00",
        "Europe/London",
      )?.toISOString(),
    ).toBe("2027-07-01T11:00:00.000Z");
    expect(
      fromDateTimeLocalInput(
        "2027-01-01T12:00",
        "Europe/London",
      )?.toISOString(),
    ).toBe("2027-01-01T12:00:00.000Z");
  });

  it("rejects malformed or impossible values", () => {
    for (const v of [
      "",
      "2027-08-20",
      "2027-02-30T10:00",
      "2027-08-20T25:00",
    ]) {
      expect(fromDateTimeLocalInput(v, "UTC")).toBeNull();
    }
  });
});
