import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GenerateCodeButton from "@/components/admin/GenerateCodeButton";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD" };

export default async function GodPage() {
  await requireAdmin("/god");
  const settings = await getSettings();
  return (
    <>
      <div className="d-flex justify-content-center">
        <Image
          alt="it's god"
          src="https://media.giphy.com/media/4Ez11VM31gFry/giphy.gif"
          width={100}
          height={100}
          unoptimized
        />
      </div>
      <h1 className="pt-3 center signature">Good Old Dashboard&trade;</h1>
      <div className="d-grid gap-2 px-3">
        <Link href="/checkin" className="btn btn-light">
          🛂 Check In
        </Link>
        <GenerateCodeButton length={Number(settings.defaultInviteCodeLength)} />
        <Link href="/god/guests" className="btn btn-light">
          👫 Guest Management
        </Link>
        <Link href="/god/invites" className="btn btn-light">
          💌 Invite Management
        </Link>
        {settings.prismaClientUrl && (
          <a
            href={settings.prismaClientUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-light"
          >
            🌈 Database
          </a>
        )}
        <Link href="/god/settings" className="btn btn-light">
          🔧 Settings
        </Link>
      </div>
    </>
  );
}
