import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatTimestamp } from "@/lib/format";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Invites" };

export default async function InvitesPage() {
  await requireAdmin("/god/invites");
  const [invites, guestsAttendingCount, settings] = await Promise.all([
    prisma.invite.findMany({
      include: { guests: { where: { isInviteRecipient: true }, take: 1 } },
      // Most recent responses first, unanswered invites last.
      orderBy: [
        { respondedAt: { sort: "desc", nulls: "last" } },
        { inviteCode: "asc" },
      ],
    }),
    prisma.guest.count({ where: { isAttending: true } }),
    getSettings(),
  ]);

  return (
    <div className="row m-3">
      <h3>Invite Management</h3>
      <p>
        Guests Attending: {guestsAttendingCount}
        <br />
        Invites Responded:{" "}
        {invites.filter((i) => i.respondedAt !== null).length}
      </p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Invite</th>
              <th>Attending</th>
              <th>Responded At</th>
              <th>Primary Contact</th>
              <th>Custom Text</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((i) => {
              const contact = i.guests[0];
              return (
                <tr key={i.id}>
                  <td>
                    <code>{i.inviteCode}</code>
                  </td>
                  <td>
                    {i.attending === null ? "Wait" : i.attending ? "Yes" : "No"}
                  </td>
                  <td>
                    {i.respondedAt
                      ? formatTimestamp(i.respondedAt, settings.timeZone)
                      : ""}
                  </td>
                  <td>
                    {contact ? `${contact.lastName}, ${contact.firstName}` : ""}
                  </td>
                  <td>{i.customText}</td>
                  <td>{i.recipientNotes}</td>
                  <td>
                    {i.inviteCode && (
                      <Link
                        href={`/god/invites/${encodeURIComponent(i.inviteCode)}`}
                        aria-label={`Open ${i.inviteCode}`}
                      >
                        💌
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
