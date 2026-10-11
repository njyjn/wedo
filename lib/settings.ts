import "server-only";
import { cache } from "react";
import prisma from "@/lib/prisma";
import { DEFAULT_TIME_ZONE } from "@/lib/format";
import {
  DEFAULT_CHANGE_POLICY,
  DEFAULT_FAQ,
  DEFAULT_INVITE_MESSAGE,
  DEFAULT_THANK_YOU,
} from "@/lib/default-content";

export type SettingKind = "text" | "markdown" | "image" | "images";

type SettingDef = {
  label: string;
  default: string;
  kind: SettingKind;
  help?: string;
};

/**
 * Admin-editable settings, stored as name/value rows in the Feature table.
 *
 * Everything specific to one couple's event (names, copy, contact details, photos) lives here
 * rather than in the repository, so a fork starts from neutral defaults.
 * Never put secrets here: values are shown in /god/settings. Secrets belong in environment variables.
 */
export const SETTINGS = {
  // Who and when
  coupleName: { label: "Couple name (short)", default: "WeDo", kind: "text" },
  groomName: { label: "Partner 1 full name", default: "", kind: "text" },
  brideName: { label: "Partner 2 full name", default: "", kind: "text" },
  defaultEventId: { label: "Default event ID", default: "1", kind: "text" },
  timeZone: {
    label: "Event time zone (IANA)",
    default: DEFAULT_TIME_ZONE,
    kind: "text",
  },

  // Look and feel
  themePreset: {
    label: "Theme",
    default: "classic",
    kind: "text",
    help: "classic, modern, garden or blush.",
  },
  themeAccent: {
    label: "Accent colour",
    default: "",
    kind: "text",
    help: "Optional hex colour for buttons and highlights, e.g. #7d6038. Pick one dark enough for white text.",
  },
  heroTagline: {
    label: "Cover tagline",
    default: "We're getting married",
    kind: "text",
    help: "Small line above your names on the home page.",
  },

  // Guest-facing content
  splashPhotos: {
    label: "Cover photos",
    default: "",
    kind: "images",
    help: "One URL per line. Uploading adds a photo.",
  },
  inviteMessage: {
    label: "Invitation message",
    default: DEFAULT_INVITE_MESSAGE,
    kind: "markdown",
  },
  inviteNotice: {
    label: "Extra note under the RSVP deadline",
    default: "",
    kind: "markdown",
    help: "Optional, e.g. attire or entry requirements.",
  },
  rsvpAgreement: {
    label: "RSVP agreement",
    default: "",
    kind: "markdown",
    help: "If set, guests must tick an Agree box with this text before submitting.",
  },
  rsvpChangePolicy: {
    label: "RSVP change policy",
    default: DEFAULT_CHANGE_POLICY,
    kind: "markdown",
  },
  faq: {
    label: "FAQ",
    default: DEFAULT_FAQ,
    kind: "markdown",
    help: "Markdown, including tables and images. Put contact details here, not in the code.",
  },
  mapQuery: {
    label: "Map location",
    default: "",
    kind: "text",
    help: "Venue name or address for the FAQ map. Needs GOOGLE_MAPS_API_KEY.",
  },
  paymentQr: {
    label: "Gift / payment QR code",
    default: "",
    kind: "image",
    help: "Optional. Shown after check-in.",
  },
  inviteTemplate: {
    label: "Printable invite card background",
    default: "",
    kind: "image",
    help: "1240 × 1748 px. Text and QR code are drawn on top.",
  },
  thankYouMessage: {
    label: "Message from the couple",
    default: DEFAULT_THANK_YOU,
    kind: "markdown",
    help: "Shown on the thank-you page (/thank-you) and on invite pages after the wedding.",
  },
  footerText: { label: "Footer text", default: "", kind: "text" },
  footerUrl: { label: "Footer link", default: "", kind: "text" },

  // Behaviour
  enableRsvpForm: {
    label: "Enable RSVP form (1 = on)",
    default: "1",
    kind: "text",
  },
  thankYouPage: {
    label: "Switch to the thank-you page after the wedding (1 = on)",
    default: "1",
    kind: "text",
    help: "On: the day after the wedding, the home page shows only your message. Off (0): the normal page stays, with a link to the thank-you page (/thank-you, which you can also open any time to preview it).",
  },
  defaultInviteCodeLength: {
    label: "Invite code length (min 6)",
    default: "8",
    kind: "text",
  },
  slackNotificationChannel: {
    label: "Slack channel for RSVP notifications",
    default: "",
    kind: "text",
  },
  prismaClientUrl: { label: "Database console URL", default: "", kind: "text" },
} as const satisfies Record<string, SettingDef>;

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

/** Only https URLs and same-site paths are rendered as images or links. */
export function isSafeUrl(url: string): boolean {
  return /^https:\/\//.test(url) || /^\/(?!\/)/.test(url);
}

/** Cover photos set in settings; empty until an admin adds some. */
export function splashPhotoList(settings: Settings): string[] {
  return settings.splashPhotos
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(isSafeUrl);
}

export function imageSetting(
  settings: Settings,
  key: "paymentQr" | "inviteTemplate",
): string | null {
  const url = settings[key].trim();
  return url && isSafeUrl(url) ? url : null;
}

/** Both partners' full names for signing messages, falling back to the short couple name. */
export function coupleSignature(settings: Settings): string {
  return (
    [settings.groomName, settings.brideName].filter(Boolean).join(" & ") ||
    settings.coupleName
  );
}
