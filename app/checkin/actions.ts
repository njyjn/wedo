"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizeInviteCode } from "@/lib/invite-code";

const checkinGuestSelect = {
  id: true,
  salutation: true,
  firstName: true,
  lastName: true,
  tableId: true,
  isAttending: true,
  isCorsageRecipient: true,
  checkedIn: true,
} as const;

export type CheckinGuest = {
  id: number;
  salutation: string | null;
  firstName: string;
  lastName: string;
  tableId: number | null;
  isAttending: boolean | null;
  isCorsageRecipient: boolean;
  checkedIn: boolean;
};

export type CheckinSearchResult =
  | { kind: "invite"; inviteCode: string; guests: CheckinGuest[] }
  | {
      kind: "suggestions";
      guests: { id: number; name: string; inviteCode: string }[];
    }
  | { kind: "notFound" };

async function loadInvite(
  where: { inviteCode: string } | { id: number },
): Promise<CheckinSearchResult> {
  const invite = await prisma.invite.findUnique({
    where,
    select: {
      inviteCode: true,
      guests: { select: checkinGuestSelect, orderBy: { id: "asc" } },
    },
  });
  if (!invite?.inviteCode) return { kind: "notFound" };
  return {
    kind: "invite",
    inviteCode: invite.inviteCode,
    guests: invite.guests,
  };
}

/** Find an invite by code, or by a guest's first/last name. */
export async function searchCheckin(
  rawQuery: string,
): Promise<CheckinSearchResult> {
  await requireAdmin("/checkin");
  const query = String(rawQuery ?? "")
    .trim()
    .slice(0, 100);
  if (!query) return { kind: "notFound" };

  const byCode = await loadInvite({ inviteCode: normalizeInviteCode(query) });
  if (byCode.kind === "invite") return byCode;

  const tokens = query.split(/\s+/).filter(Boolean);
  const guests = await prisma.guest.findMany({
    where: {
      inviteId: { not: null },
      OR: [
        { firstName: { startsWith: query, mode: "insensitive" } },
        { lastName: { startsWith: query, mode: "insensitive" } },
        ...tokens.flatMap((t) => [
          { firstName: { equals: t, mode: "insensitive" as const } },
          { lastName: { equals: t, mode: "insensitive" as const } },
        ]),
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      inviteId: true,
      invite: { select: { inviteCode: true } },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 20,
  });

  if (guests.length === 1 && guests[0].inviteId)
    return loadInvite({ id: guests[0].inviteId });
  const suggestions = guests
    .filter((g) => g.invite?.inviteCode)
    .map((g) => ({
      id: g.id,
      name: `${g.firstName} ${g.lastName}`,
      inviteCode: g.invite!.inviteCode!,
    }));
  return suggestions.length > 0
    ? { kind: "suggestions", guests: suggestions }
    : { kind: "notFound" };
}

const checkInSchema = z.object({
  inviteCode: z.string().min(1).max(32),
  guestIds: z.array(z.number().int().positive()).max(100),
});

/** Mark exactly the selected guests of this invite as checked in (and the rest as not). */
export async function checkInGuests(
  input: z.input<typeof checkInSchema>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin("/checkin");
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request" };
  const { inviteCode, guestIds } = parsed.data;

  const invite = await prisma.invite.findUnique({
    where: { inviteCode: normalizeInviteCode(inviteCode) },
    select: { id: true, guests: { select: { id: true } } },
  });
  if (!invite) return { ok: false, error: "Invite not found" };
  const onInvite = new Set(invite.guests.map((g) => g.id));
  if (guestIds.some((id) => !onInvite.has(id)))
    return { ok: false, error: "Guest is not on this invite" };

  await prisma.$transaction([
    prisma.guest.updateMany({
      where: { inviteId: invite.id, id: { in: guestIds } },
      data: { checkedIn: true },
    }),
    prisma.guest.updateMany({
      where: { inviteId: invite.id, id: { notIn: guestIds } },
      data: { checkedIn: false },
    }),
  ]);
  return { ok: true };
}
