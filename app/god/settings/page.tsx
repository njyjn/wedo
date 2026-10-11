import type { Metadata } from "next";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings, SETTING_KEYS, SETTINGS } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD | Settings" };

export default async function SettingsPage() {
  await requireAdmin("/god/settings");
  const settings = await getSettings();
  return (
    <div className="row m-3">
      <h3>Settings</h3>
      <p className="text-muted small">
        Secrets such as the Slack bot token are configured as environment
        variables, not here.
      </p>
      <SettingsForm
        fields={SETTING_KEYS.map((key) => ({
          key,
          label: SETTINGS[key].label,
          value: settings[key],
          multiline: key === "splashPhotos",
        }))}
      />
    </div>
  );
}
