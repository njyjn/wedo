import type { Metadata } from "next";
import Checkin from "@/components/Checkin";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Check In" };

export default async function CheckinPage() {
  await requireAdmin("/checkin");
  const settings = await getSettings();
  return <Checkin coupleName={settings.coupleName} />;
}
