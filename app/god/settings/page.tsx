import type { Metadata } from "next";
import EventForm from "@/components/admin/EventForm";
import ImageSettings from "@/components/admin/ImageSettings";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { isBlobConfigured } from "@/lib/blob";
import { toDateTimeLocalInput } from "@/lib/format";
import prisma from "@/lib/prisma";
import { getSettings, isSafeUrl, SETTING_KEYS, SETTINGS } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Settings" };

export default async function SettingsPage() {
  await requireAdmin("/god/settings");
  const settings = await getSettings();
  const eventId = Number.parseInt(settings.defaultEventId, 10);
  const event = Number.isSafeInteger(eventId)
    ? await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          name: true,
          startTime: true,
          location: true,
          sublocation: true,
        },
      })
    : null;
  const field = (key: (typeof SETTING_KEYS)[number]) => {
    const def: {
      label: string;
      kind: "text" | "markdown" | "image" | "images";
      help?: string;
    } = SETTINGS[key];
    return {
      key,
      label: def.label,
      kind: def.kind,
      help: def.help,
      value: settings[key],
    };
  };
  const imageKeys = SETTING_KEYS.filter(
    (k) => SETTINGS[k].kind === "image" || SETTINGS[k].kind === "images",
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <p className="eyebrow">God mode</p>
        <h1 className="admin-title">Settings</h1>
        <p className="text-muted mb-0">
          Everything about your event lives here, not in the code, so it never
          ends up in the repository. Secrets such as the Slack bot token are
          environment variables.
        </p>
      </div>

      <section className="admin-card">
        <h2 className="admin-card-title">Event</h2>
        <p className="text-muted small">
          The wedding date and venue shown on the home page and invitations.
          {!event && " No event exists yet; saving creates one."}
        </p>
        <EventForm
          timeZone={settings.timeZone}
          event={{
            name: event?.name ?? "",
            startTime: event
              ? toDateTimeLocalInput(event.startTime, settings.timeZone)
              : "",
            location: event?.location ?? "",
            sublocation: event?.sublocation ?? "",
          }}
        />
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">Images</h2>
        <p className="text-muted small">
          {isBlobConfigured()
            ? "Uploads are stored in Vercel Blob."
            : "Uploads need a Vercel Blob store connected to the project. Without one, paste image URLs into the fields below."}
        </p>
        <ImageSettings
          fields={imageKeys.map((k) => {
            const f = field(k);
            return {
              key: k,
              label: f.label,
              help: f.help,
              urls: f.value.split(/\s+/).filter(Boolean).filter(isSafeUrl),
            };
          })}
        />
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">All settings</h2>
        <SettingsForm fields={SETTING_KEYS.map(field)} />
      </section>
    </div>
  );
}
