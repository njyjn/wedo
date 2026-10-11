import type { Metadata } from "next";
import ThankYouPage from "@/components/ThankYouPage";
import { getDefaultEvent } from "@/lib/event";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Thank you" };

// Always available, so admins can preview it and guests can reach it while the home page is
// kept as is (thankYouPage switched off).
export default async function ThankYou() {
  const settings = await getSettings();
  const event = await getDefaultEvent(settings.defaultEventId);
  return <ThankYouPage settings={settings} event={event} />;
}
