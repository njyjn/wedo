"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  generateInviteCode,
  MIN_INVITE_CODE_LENGTH,
  normalizeInviteCode,
} from "@/lib/invite-code";
import { getSettings, SETTING_KEYS, SETTINGS } from "@/lib/settings";

export type ActionState = { ok?: boolean; message?: string };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => s || null);

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function fail(error: unknown, fallback: string): ActionState {
  console.error(error);
  return { ok: false, message: fallback };
}

const guestSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phoneNumber: optionalText(30),
  salutation: optionalText(30),
  isAttending: z.boolean(),
});

export async function addGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/god/guests");
  const parsed = guestSchema.safeParse({
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    phoneNumber: str(formData, "phoneNumber"),
    salutation: str(formData, "salutation"),
    isAttending: formData.get("isAttending") === "on",
  });
  if (!parsed.success)
    return { ok: false, message: "First and last name are required." };
  const { isAttending, ...data } = parsed.data;
  try {
    // Unticked means "not responded yet", not "declined".
    await prisma.guest.create({
      data: { ...data, isAttending: isAttending ? true : null },
    });
  } catch (e) {
    return fail(e, "Could not add guest.");
  }
  revalidatePath("/god", "layout");
  return { ok: true, message: `Added ${data.firstName} ${data.lastName}.` };
}

// "" = leave unchanged, "-1" = unassign, otherwise the id to assign.
const assignmentSchema = z.union([
  z.literal(""),
  z.literal("-1"),
  z.string().regex(/^\d{1,9}$/),
]);

export async function assignGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/god/guests");
  const parsed = z
    .object({
      guestId: z.coerce.number().int().positive(),
      tableId: assignmentSchema,
      inviteId: assignmentSchema,
    })
    .safeParse({
      guestId: str(formData, "guestId"),
      tableId: str(formData, "tableId"),
      inviteId: str(formData, "inviteId"),
    });
  if (!parsed.success) return { ok: false, message: "Select a guest." };
  const { guestId, tableId, inviteId } = parsed.data;
  if (tableId === "" && inviteId === "")
    return { ok: false, message: "Select either a table or invite to assign." };

  const toId = (v: string) => (v === "-1" ? null : Number(v));
  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...(tableId !== "" && { tableId: toId(tableId) }),
        ...(inviteId !== "" && { inviteId: toId(inviteId) }),
      },
    });
  } catch (e) {
    return fail(
      e,
      "Could not assign guest. Does that guest, table or invite still exist?",
    );
  }
  revalidatePath("/god", "layout");
  return { ok: true, message: "Assigned." };
}

const inviteSchema = z.object({
  inviteCode: z
    .string()
    .transform(normalizeInviteCode)
    .pipe(
      z
        .string()
        .regex(
          /^[A-Z0-9]*$/,
          "Invite codes may only contain letters and numbers.",
        )
        .refine((c) => c === "" || c.length >= MIN_INVITE_CODE_LENGTH, {
          message: `Invite codes must be at least ${MIN_INVITE_CODE_LENGTH} characters.`,
        })
        .refine((c) => c.length <= 32, { message: "Invite code is too long." }),
    ),
  type: z.enum(["live", "zoom"]),
  primaryContactGuestId: z.coerce
    .number()
    .int()
    .positive({ message: "Select a primary contact to assign." }),
  respondBy: z.union([z.literal(""), z.iso.date()]),
});

export async function createInvite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/god/guests");
  const parsed = inviteSchema.safeParse({
    inviteCode: str(formData, "inviteCode"),
    type: str(formData, "type"),
    primaryContactGuestId: str(formData, "primaryContactGuestId") || "0",
    respondBy: str(formData, "respondBy"),
  });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid invite.",
    };
  const { type, primaryContactGuestId, respondBy } = parsed.data;

  const settings = await getSettings();
  const eventId = Number.parseInt(settings.defaultEventId, 10);
  const inviteCode =
    parsed.data.inviteCode ||
    generateInviteCode(Number(settings.defaultInviteCodeLength));
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event)
      return {
        ok: false,
        message: `Default event ${settings.defaultEventId} does not exist. Check settings.`,
      };
    if (
      await prisma.invite.findUnique({
        where: { inviteCode },
        select: { id: true },
      })
    ) {
      return {
        ok: false,
        message: `Invite code ${inviteCode} is already taken.`,
      };
    }
    await prisma.$transaction([
      prisma.invite.create({
        data: {
          eventId: event.id,
          inviteCode,
          type,
          issuedAt: new Date(),
          // Date-only: stored as midnight UTC and treated as "by the end of this day".
          respondBy: respondBy ? new Date(respondBy) : null,
          guests: { connect: { id: primaryContactGuestId } },
        },
      }),
      prisma.guest.update({
        where: { id: primaryContactGuestId },
        data: { isInviteRecipient: true },
      }),
    ]);
  } catch (e) {
    return fail(e, "Could not create invite.");
  }
  revalidatePath("/god", "layout");
  return { ok: true, message: `Created invite ${inviteCode}.` };
}

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin("/god/settings");
  const values = SETTING_KEYS.filter((k) => formData.has(k)).map(
    (k) => [k, str(formData, k).trim()] as const,
  );

  for (const [key, value] of values) {
    if (value.length > 5000)
      return { ok: false, message: `${SETTINGS[key].label} is too long.` };
  }
  const tz = values.find(([k]) => k === "timeZone")?.[1];
  if (tz) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz });
    } catch {
      return { ok: false, message: `"${tz}" is not a valid time zone.` };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const [name, value] of values) {
        const { count } = await tx.feature.updateMany({
          where: { name },
          data: { value },
        });
        if (count === 0) await tx.feature.create({ data: { name, value } });
      }
    });
  } catch (e) {
    return fail(e, "Could not save settings.");
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}
