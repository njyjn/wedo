"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifyHCaptcha } from "@/lib/hcaptcha";
import { normalizeInviteCode } from "@/lib/invite-code";
import { isRsvpClosed, planRsvp } from "@/lib/rsvp";
import { getSettings } from "@/lib/settings";
import { sendRsvpNotification } from "@/lib/slack";

const inviteCodeSchema = z
  .string()
  .transform(normalizeInviteCode)
  .pipe(z.string().regex(/^[A-Z0-9]{1,32}$/));

export type LookupState = { error?: string; code?: string };

/** Home page lookup: go to the invite if it exists. */
export async function openInvite(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const raw = String(formData.get("code") ?? "");
  const parsed = inviteCodeSchema.safeParse(raw);
  if (!parsed.success)
    return { error: "Please enter your invite code.", code: raw };
  const invite = await prisma.invite.findUnique({
    where: { inviteCode: parsed.data },
    select: { id: true },
  });
  if (!invite) {
    return {
      error:
        "Invalid invite code! Please try again or contact the host for assistance.",
      code: raw,
    };
  }
  redirect(`/rsvp/${encodeURIComponent(parsed.data)}`);
}

const submissionSchema = z.object({
  code: inviteCodeSchema,
  captcha: z.string().min(1).max(10_000),
  attending: z.boolean(),
  guestIds: z.array(z.number().int().positive()).max(100),
  recipientNotes: z.string().max(2000).optional().default(""),
});

export type RsvpResult = { ok: true } | { ok: false; error: string };

export async function submitRsvp(
  input: z.input<typeof submissionSchema>,
): Promise<RsvpResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Invalid submission. Please try again." };
  const { code, captcha, attending, guestIds, recipientNotes } = parsed.data;

  if (!(await verifyHCaptcha(captcha))) {
    return {
      ok: false,
      error: "Captcha verification failed. Please try again.",
    };
  }

  const [invite, settings] = await Promise.all([
    prisma.invite.findUnique({
      where: { inviteCode: code },
      select: {
        id: true,
        inviteCode: true,
        respondBy: true,
        event: { select: { startTime: true } },
        guests: {
          select: { id: true, firstName: true },
          orderBy: { id: "asc" },
        },
      },
    }),
    getSettings(),
  ]);
  if (!invite) return { ok: false, error: "Invite not found." };
  if (
    isRsvpClosed(invite.respondBy, invite.event.startTime, settings.timeZone)
  ) {
    return {
      ok: false,
      error:
        "The RSVP window for this invite has closed. Please contact the couple directly.",
    };
  }

  const plan = planRsvp(
    invite.guests.map((g) => g.id),
    { attending, guestIds },
  );
  if (!plan.ok) return plan;

  const notes = recipientNotes.trim() || null;
  await prisma.$transaction([
    prisma.invite.update({
      where: { id: invite.id },
      data: { attending, respondedAt: new Date(), recipientNotes: notes },
    }),
    prisma.guest.updateMany({
      where: { inviteId: invite.id, id: { in: plan.attendingIds } },
      data: { isAttending: true },
    }),
    prisma.guest.updateMany({
      where: { inviteId: invite.id, id: { in: plan.notAttendingIds } },
      data: { isAttending: false },
    }),
  ]);

  const attendingIds = new Set(plan.attendingIds);
  // Notify after the response is sent, so a slow Slack API never delays the guest.
  after(() =>
    sendRsvpNotification(settings.slackNotificationChannel, {
      inviteCode: code,
      attending,
      guests: invite.guests.map((g) => ({
        firstName: g.firstName,
        isAttending: attendingIds.has(g.id),
      })),
      recipientNotes: notes,
    }),
  );

  revalidatePath(`/rsvp/${code}`);
  return { ok: true };
}
