// Pure RSVP rules, shared by the server action and unit tests.
import { endOfCalendarDay, isDateOnly } from "@/lib/format";

export type RsvpSubmission = {
  attending: boolean;
  guestIds: number[];
};

export type RsvpPlan =
  | { ok: true; attendingIds: number[]; notAttendingIds: number[] }
  | { ok: false; error: string };

/**
 * When the RSVP form closes. A respond-by date means "by the end of that day" in the event's
 * time zone; without one, RSVPs close when the event starts.
 */
export function rsvpClosesAt(
  respondBy: Date | null,
  eventStart: Date,
  timeZone: string,
): Date {
  if (!respondBy) return eventStart;
  return isDateOnly(respondBy)
    ? endOfCalendarDay(respondBy, timeZone)
    : respondBy;
}

export function isRsvpClosed(
  respondBy: Date | null,
  eventStart: Date,
  timeZone: string,
  now = new Date(),
): boolean {
  return now > rsvpClosesAt(respondBy, eventStart, timeZone);
}

/** Decide which of the invite's guests are attending. Only guests on this invite can be changed. */
export function planRsvp(
  inviteGuestIds: number[],
  submission: RsvpSubmission,
): RsvpPlan {
  const onInvite = new Set(inviteGuestIds);
  if (submission.guestIds.some((id) => !onInvite.has(id))) {
    return { ok: false, error: "That guest is not on this invite." };
  }
  if (!submission.attending) {
    return { ok: true, attendingIds: [], notAttendingIds: [...inviteGuestIds] };
  }
  const selected = new Set(submission.guestIds);
  if (selected.size === 0) {
    return {
      ok: false,
      error:
        'Please indicate which guests are attending. If none, select "Unable to Attend".',
    };
  }
  return {
    ok: true,
    attendingIds: inviteGuestIds.filter((id) => selected.has(id)),
    notAttendingIds: inviteGuestIds.filter((id) => !selected.has(id)),
  };
}
