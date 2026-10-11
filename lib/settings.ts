import "server-only";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { DEFAULT_TIME_ZONE } from "@/lib/format";

/**
 * Admin-editable settings, stored as name/value rows in the Feature table.
 * Never put secrets here: values are shown in /god/settings. Secrets belong in environment variables.
 */
export const SETTINGS = {
  coupleName: { label: "Couple name (short)", default: "WeDo" },
  groomName: { label: "Groom's full name", default: "" },
  brideName: { label: "Bride's full name", default: "" },
  footerText: { label: "Footer text", default: "" },
  defaultEventId: { label: "Default event ID", default: "1" },
  defaultInviteCodeLength: {
    label: "Invite code length (min 6)",
    default: "8",
  },
  enableRsvpForm: { label: "Enable RSVP form (1 = on)", default: "1" },
  timeZone: { label: "Event time zone (IANA)", default: DEFAULT_TIME_ZONE },
  splashPhotos: { label: "Splash photo URLs (one per line)", default: "" },
  slackNotificationChannel: {
    label: "Slack channel for RSVP notifications",
    default: "",
  },
  prismaClientUrl: { label: "Database console URL", default: "" },
} as const;

export type SettingKey = keyof typeof SETTINGS;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

export function isSettingKey(name: string): name is SettingKey {
  return Object.hasOwn(SETTINGS, name);
}

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** All known settings, with defaults for anything missing. Cached per request. */
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.feature.findMany({
    where: { name: { in: SETTING_KEYS } },
    orderBy: { id: "asc" },
  });
  const settings = Object.fromEntries(
    SETTING_KEYS.map((k) => [k, SETTINGS[k].default]),
  ) as Settings;
  for (const row of rows) {
    if (isSettingKey(row.name) && row.value) settings[row.name] = row.value;
  }
  if (!isValidTimeZone(settings.timeZone))
    settings.timeZone = DEFAULT_TIME_ZONE;
  return settings;
});

export function splashPhotoList(settings: Settings): string[] {
  const photos = settings.splashPhotos
    .split(/\s+/)
    .map((p) => p.trim())
    .filter((p) => /^https:\/\//.test(p) || p.startsWith("/"));
  return photos.length > 0 ? photos : ["/main.png"];
}
