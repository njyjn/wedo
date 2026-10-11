import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import InviteImage from "@/components/admin/InviteImage";
import { requireAdmin } from "@/lib/auth";
import { formatCalendarDate, formatDateShort } from "@/lib/format";
import { normalizeInviteCode } from "@/lib/invite-code";
import { printFormalName } from "@/lib/names";
import prisma from "@/lib/prisma";
import { getSettings, imageSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Invite" };

async function siteUrl(): Promise<string> {
  if (process.env.APP_BASE_URL)
    return process.env.APP_BASE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export default async function InviteDetailPage({
  params,
}: PageProps<"/god/invites/[code]">) {
  const code = normalizeInviteCode(decodeURIComponent((await params).code));
  await requireAdmin(`/god/invites/${encodeURIComponent(code)}`);
  const [invite, settings, baseUrl] = await Promise.all([
    prisma.invite.findUnique({
      where: { inviteCode: code },
      include: { event: true, guests: { orderBy: { id: "asc" } } },
    }),
    getSettings(),
    siteUrl(),
  ]);
  if (!invite?.inviteCode) notFound();

  const { event, guests } = invite;
  const tz = settings.timeZone;
  const recipient = guests.find((g) => g.isInviteRecipient);
  const attendingGuests = guests.filter((g) => g.isAttending);
  const rsvpUrl = `${baseUrl}/rsvp/${encodeURIComponent(invite.inviteCode)}`;
  const respondBy = invite.respondBy ?? event.startTime;
  const signature =
    [settings.groomName, settings.brideName].filter(Boolean).join(" & ") ||
    settings.coupleName;
  const recipientText = printFormalName(guests);

  return (
    <>
      <div className="row m-3">
        <Link href="/god/invites">
          <h3>Invite Management</h3>
        </Link>
        <b>{invite.inviteCode}</b>
        <p>
          Event: {event.name}
          <br />
          Type: {invite.type}
          <br />
          Recipient:{" "}
          {recipient
            ? `${recipient.firstName} ${recipient.lastName} (${recipient.phoneNumber ?? "no phone"})`
            : "None"}
        </p>
        <h5>Response</h5>
        <p>
          {invite.attending === null
            ? "Not responded"
            : invite.attending
              ? `Attending (${attendingGuests.length})`
              : "Not Attending"}
        </p>
        <ul>
          {attendingGuests.map((g) => (
            <li key={g.id}>
              {g.firstName} {g.lastName}
            </li>
          ))}
        </ul>
        <p>
          <b>Message: </b>
          {invite.recipientNotes || "None"}
        </p>
        <h5>Suggested Accompanying Text</h5>
        <pre className="text-wrap">
          {`Dear ${recipientText}:

Kindly RSVP at ${rsvpUrl} by ${formatCalendarDate(respondBy, tz)}.

Thank you and we hope to see you there!

Regards, ${signature}`}
        </pre>
      </div>
      <div className="row m-3">
        <h5>Image</h5>
        <InviteImage
          inviteCode={invite.inviteCode}
          templateUrl={imageSetting(settings, "inviteTemplate")}
          rsvpUrl={rsvpUrl}
          respondBy={
            invite.respondBy
              ? formatDateShort(invite.respondBy, "UTC")
              : formatDateShort(event.startTime, tz)
          }
          defaultRecipientText={recipientText}
        />
      </div>
    </>
  );
}
