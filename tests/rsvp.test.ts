import { describe, expect, it } from "vitest";
import { isRsvpClosed, planRsvp, rsvpClosesAt } from "@/lib/rsvp";

describe("planRsvp", () => {
  const onInvite = [1, 2, 3];

  it("splits the invite's guests into attending and not attending", () => {
    expect(planRsvp(onInvite, { attending: true, guestIds: [3, 1] })).toEqual({
      ok: true,
      attendingIds: [1, 3],
      notAttendingIds: [2],
    });
  });

  it("marks everyone as not attending when declining, ignoring any selection", () => {
    expect(planRsvp(onInvite, { attending: false, guestIds: [] })).toEqual({
      ok: true,
      attendingIds: [],
      notAttendingIds: [1, 2, 3],
    });
  });

  it("rejects guests that are not on the invite", () => {
    expect(planRsvp(onInvite, { attending: true, guestIds: [1, 99] }).ok).toBe(
      false,
    );
    expect(planRsvp(onInvite, { attending: false, guestIds: [99] }).ok).toBe(
      false,
    );
  });

  it("requires at least one guest when attending", () => {
    expect(planRsvp(onInvite, { attending: true, guestIds: [] }).ok).toBe(
      false,
    );
  });
});

describe("RSVP deadline", () => {
  const tz = "Asia/Singapore";
  const eventStart = new Date("2022-08-20T10:30:00Z");
  const respondBy = new Date("2022-07-01"); // date-only => midnight UTC

  it("stays open until the end of the respond-by day in the event's time zone", () => {
    expect(rsvpClosesAt(respondBy, eventStart, tz).toISOString()).toBe(
      "2022-07-01T15:59:59.999Z",
    );
    expect(
      isRsvpClosed(respondBy, eventStart, tz, new Date("2022-07-01T15:59:00Z")),
    ).toBe(false);
    expect(
      isRsvpClosed(respondBy, eventStart, tz, new Date("2022-07-01T16:00:00Z")),
    ).toBe(true);
  });

  it("falls back to the event start when there is no respond-by date", () => {
    expect(
      isRsvpClosed(null, eventStart, tz, new Date("2022-08-20T10:29:00Z")),
    ).toBe(false);
    expect(
      isRsvpClosed(null, eventStart, tz, new Date("2022-08-20T10:31:00Z")),
    ).toBe(true);
  });

  it("uses an exact respond-by timestamp as-is", () => {
    const exact = new Date("2022-07-01T12:00:00Z");
    expect(rsvpClosesAt(exact, eventStart, tz)).toEqual(exact);
  });
});
