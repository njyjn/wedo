import type { Metadata } from "next";
import Link from "next/link";
import {
  QuickAddGuest,
  QuickAssignTableInvite,
  QuickGenerateInvite,
} from "@/components/admin/QuickAdd";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Guests" };

function guestStatus(g: { checkedIn: boolean; isAttending: boolean | null }) {
  if (g.checkedIn) return "Seated";
  if (g.isAttending === null) return "Wait";
  return g.isAttending ? "Yes" : "No";
}

// Alternate row shading by table. Tables 1-3 shade on even ids, later tables on odd ids,
// matching the venue's floor plan.
function isShadedTable(tableId: number | null) {
  if (!tableId) return false;
  return tableId > 3 ? (tableId - 1) % 2 === 0 : tableId % 2 === 0;
}

export default async function GuestsPage() {
  await requireAdmin("/god/guests");
  const [guests, tables, invites, settings] = await Promise.all([
    prisma.guest.findMany({
      include: { invite: { select: { inviteCode: true } } },
      orderBy: [
        { tableId: "asc" },
        { invite: { inviteCode: "asc" } },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    }),
    prisma.table.findMany({ orderBy: { id: "asc" } }),
    prisma.invite.findMany({
      select: {
        id: true,
        inviteCode: true,
        guests: {
          where: { isInviteRecipient: true },
          select: { firstName: true, lastName: true },
          take: 1,
        },
      },
      orderBy: { inviteCode: "asc" },
    }),
    getSettings(),
  ]);

  const guestOptions = [...guests]
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .map((g) => ({
      id: g.id,
      name: `${g.firstName} ${g.lastName}`,
      inviteCode: g.invite?.inviteCode ?? null,
    }));
  const countAt = (tableId: number, attendingOnly: boolean) =>
    guests.filter(
      (g) => g.tableId === tableId && (!attendingOnly || g.isAttending),
    ).length;
  const tableOptions = tables.map((t) => ({
    id: t.id,
    label: `${t.id} (${countAt(t.id, false)}/${t.maxPax ?? "?"})${t.isVip ? " - VIP" : ""}`,
  }));
  const inviteOptions = invites.map((i) => {
    const r = i.guests[0];
    return {
      id: i.id,
      label: `${i.inviteCode} (${r ? `${r.firstName} ${r.lastName}` : "Unassigned"})`,
    };
  });

  return (
    <div className="row m-3">
      <h3>Guest Management</h3>
      <p>
        Attending/Count: {guests.filter((g) => g.isAttending).length}/
        {guests.filter((g) => g.isAttending !== false).length}
      </p>
      <QuickAddGuest />
      <QuickAssignTableInvite
        guests={guestOptions}
        tables={tableOptions}
        invites={inviteOptions}
      />
      <QuickGenerateInvite
        guests={guestOptions}
        codeLength={Number(settings.defaultInviteCodeLength)}
      />
      <p>
        <i>For other edits, use Prisma Studio</i>
      </p>
      <div className="table-responsive">
        <table className="table table-hover text-center">
          <thead>
            <tr>
              {tables.map((t) => (
                <th key={t.id}>{t.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {tables.map((t) => (
                <td key={t.id}>
                  {countAt(t.id, true)}/{countAt(t.id, false)}/{t.maxPax ?? "?"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Plain <a>: this is a file download from a route handler. */}
      <a
        href="/god/guests/export"
        className="btn btn-light mb-3 text-center"
        download
      >
        📤 Export seating chart as CSV
      </a>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Table</th>
              <th>Invite Code</th>
              <th>R/A</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr
                key={g.id}
                className={
                  isShadedTable(g.tableId) ? "table-warning" : undefined
                }
              >
                <td>
                  {g.lastName}, {g.firstName}
                  {g.isChild ? " 👶🏻" : ""}
                  {g.isInviteRecipient ? " 💌" : ""}
                  {g.isCorsageRecipient ? " 🌺" : ""}
                  {g.salutation ? ` (${g.salutation})` : ""}
                </td>
                <td>{g.phoneNumber}</td>
                <td>{g.tableId}</td>
                <td>
                  {g.invite?.inviteCode && (
                    <Link
                      href={`/god/invites/${encodeURIComponent(g.invite.inviteCode)}`}
                    >
                      <code>{g.invite.inviteCode}</code>
                    </Link>
                  )}
                </td>
                <td>{guestStatus(g)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
