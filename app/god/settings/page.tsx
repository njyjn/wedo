import type { Metadata } from "next";
import ImageSettings from "@/components/admin/ImageSettings";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings, isSafeUrl, SETTING_KEYS, SETTINGS } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Settings" };

export default async function SettingsPage() {
  await requireAdmin("/god/settings");
  const settings = await getSettings();
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
    <div className="row m-3">
      <div className="col-lg-9">
        <h3>Settings</h3>
        <p className="text-muted small">
          Everything about your event lives here, not in the code, so it never
          ends up in the repository. Secrets such as the Slack bot token are
          environment variables.
        </p>
        <h5 className="mt-3">Images</h5>
        <p className="text-muted small">
          {process.env.BLOB_READ_WRITE_TOKEN
            ? "Uploads are stored in Vercel Blob."
            : "Uploads need a Vercel Blob store (BLOB_READ_WRITE_TOKEN). Without one, paste image URLs into the fields below."}
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
        <h5 className="mt-3">All settings</h5>
        <SettingsForm fields={SETTING_KEYS.map(field)} />
      </div>
    </div>
  );
}
