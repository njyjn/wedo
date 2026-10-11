import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import RsvpForm from "@/components/RsvpForm";
import { DEFAULT_INVITE_MESSAGE, VaccinationNotice } from "@/content/rsvp";
import Faq from "@/content/faq";
import {
  formatCalendarDate,
  formatDateLong,
  formatDateTimeLong,
} from "@/lib/format";
import { normalizeInviteCode } from "@/lib/invite-code";
import { printFormalName } from "@/lib/names";
import prisma from "@/lib/prisma";
import { isRsvpClosed, rsvpClosesAt } from "@/lib/rsvp";
import { getSettings } from "@/lib/settings";

// Only what the guest needs to see. Never select phone numbers, emails or table assignments here:
// anyone holding (or guessing) the invite code can load this page.
const getInvite = cache((code: string) =>
  prisma.invite.findUnique({
    where: { inviteCode: code },
    select: {
      inviteCode: true,
      attending: true,
      respondBy: true,
      recipientNotes: true,
      customText: true,
      event: {
        select: {
          name: true,
          startTime: true,
          location: true,
          sublocation: true,
        },
      },
      guests: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          salutation: true,
          isInviteRecipient: true,
          isAttending: true,
        },
        orderBy: { id: "asc" },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: PageProps<"/rsvp/[code]">): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `RSVP for ${normalizeInviteCode(decodeURIComponent(code))}`,
    robots: { index: false },
  };
}

export default async function InvitePage({
  params,
}: PageProps<"/rsvp/[code]">) {
  const code = normalizeInviteCode(decodeURIComponent((await params).code));
  const [invite, settings] = await Promise.all([
    getInvite(code),
    getSettings(),
  ]);
  if (!invite || !invite.inviteCode) notFound();

  const { event, guests } = invite;
  const tz = settings.timeZone;
  const closed = isRsvpClosed(invite.respondBy, event.startTime, tz);
  const respondBy = invite.respondBy
    ? formatCalendarDate(invite.respondBy, tz)
    : formatDateLong(event.startTime, tz);
  const signature =
    [settings.groomName, settings.brideName].filter(Boolean).join(" & ") ||
    settings.coupleName;

  return (
    <div className="rsvp-layout">
      <div className="card">
        <div className="card-header">
          Invite Code <code>{invite.inviteCode}</code>
        </div>
        <div className="card-body">
          <h5 className="card-title">Dearest {printFormalName(guests)}</h5>
          <p>
            Together with our families, we cordially invite you to{" "}
            <b>{event.name}</b>.
          </p>
          <p>
            Date: {formatDateTimeLong(event.startTime, tz)}. Please refer to the
            FAQs below for the full program details.
            <br />
            Venue: {event.location}
            {event.sublocation ? ` (${event.sublocation})` : ""}
          </p>
          <p>
            Please respond latest <b>by {respondBy}</b> so that we can finalize
            our guestlist for submission to the venue. <VaccinationNotice />
          </p>
          <p>{invite.customText || DEFAULT_INVITE_MESSAGE}</p>
          <p>With gratitude,</p>
          <h3 className="signature">{signature}</h3>
        </div>
        <div className="card-body border-top">
          {closed ? (
            <>
              <h6 className="card-subtitle center mb-3">
                RSVP window closed on{" "}
                {formatDateLong(
                  rsvpClosesAt(invite.respondBy, event.startTime, tz),
                  tz,
                )}
              </h6>
              <p>
                Your response was:{" "}
                <b>
                  {invite.attending === null
                    ? "No response"
                    : invite.attending
                      ? "Attending"
                      : "Not Attending"}
                </b>
              </p>
              <p>
                Please contact the couple if you have to make any changes.
                Contact information can be found in the FAQ below.
              </p>
            </>
          ) : (
            <RsvpForm
              code={invite.inviteCode}
              recipientNotes={invite.recipientNotes ?? ""}
              guests={guests.map((g) => ({
                id: g.id,
                name: `${g.firstName} ${g.lastName}`,
                isAttending: g.isAttending,
              }))}
            />
          )}
        </div>
      </div>
      <Faq />
    </div>
  );
}
