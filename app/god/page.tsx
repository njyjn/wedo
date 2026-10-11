import type { Metadata } from "next";
import Link from "next/link";
import GenerateCodeButton from "@/components/admin/GenerateCodeButton";
import { requireAdmin } from "@/lib/auth";
import {
  calendarDaysUntil,
  countdownLabel,
  formatDateTimeLong,
} from "@/lib/format";
import prisma from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "GOD" };

const icons = {
  checkin:
    "M9 12l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z",
  guests:
    "M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8zM21 20v-2a4 4 0 00-3-3.87M16 2.13a4 4 0 010 7.75",
  invites: "M4 6h16v12H4zM4 7l8 6 8-6",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
  database:
    "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default async function GodPage() {
  await requireAdmin("/god");
  const settings = await getSettings();
  const eventId = Number.parseInt(settings.defaultEventId, 10);
  const [event, invites, responded, attendance, checkedIn] = await Promise.all([
    Number.isSafeInteger(eventId)
      ? prisma.event.findUnique({
          where: { id: eventId },
          select: { startTime: true, location: true },
        })
      : null,
    prisma.invite.count(),
    prisma.invite.count({ where: { respondedAt: { not: null } } }),
    prisma.guest.groupBy({ by: ["isAttending"], _count: { _all: true } }),
    prisma.guest.count({ where: { checkedIn: true } }),
  ]);
  const count = (v: boolean | null) =>
    attendance.find((a) => a.isAttending === v)?._count._all ?? 0;
  const guests = attendance.reduce((n, a) => n + a._count._all, 0);
  const tz = settings.timeZone;

  const stats = [
    { label: "Attending", value: count(true), note: `of ${guests} guests` },
    { label: "Declined", value: count(false) },
    { label: "Awaiting reply", value: count(null) },
    {
      label: "Invites answered",
      value: responded,
      note: `of ${invites}`,
    },
    { label: "Checked in", value: checkedIn },
  ];

  const tiles = [
    {
      href: "/checkin",
      icon: icons.checkin,
      title: "Check in",
      text: "Welcome guests at the door by code, name or QR.",
    },
    {
      href: "/god/guests",
      icon: icons.guests,
      title: "Guests",
      text: "Add guests, assign tables and export the seating chart.",
    },
    {
      href: "/god/invites",
      icon: icons.invites,
      title: "Invites",
      text: "Track responses and print invite cards.",
    },
    {
      href: "/god/settings",
      icon: icons.settings,
      title: "Settings",
      text: "Wedding date, venue, theme, photos and wording.",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <p className="eyebrow">Good Old Dashboard&trade;</p>
        <h1 className="admin-title">{settings.coupleName}</h1>
        {event ? (
          <p className="text-muted mb-0">
            {formatDateTimeLong(event.startTime, tz)} · {event.location}
            {(() => {
              const label = countdownLabel(
                calendarDaysUntil(event.startTime, tz),
              );
              return label ? (
                <span className="admin-pill ms-2">{label}</span>
              ) : null;
            })()}
          </p>
        ) : (
          <p className="text-muted mb-0">
            No event yet.{" "}
            <Link href="/god/settings">Set the date and venue</Link>.
          </p>
        )}
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.note && <div className="stat-note">{s.note}</div>}
          </div>
        ))}
      </div>

      <div className="tile-grid">
        {tiles.map((t) => (
          <Link href={t.href} className="admin-tile" key={t.href}>
            <span className="admin-tile-icon">
              <Icon path={t.icon} />
            </span>
            <span>
              <span className="admin-tile-title">{t.title}</span>
              <span className="admin-tile-text">{t.text}</span>
            </span>
          </Link>
        ))}
        {settings.prismaClientUrl && (
          <a
            href={settings.prismaClientUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="admin-tile"
          >
            <span className="admin-tile-icon">
              <Icon path={icons.database} />
            </span>
            <span>
              <span className="admin-tile-title">Database</span>
              <span className="admin-tile-text">
                Open the database console.
              </span>
            </span>
          </a>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Spare invite code</h2>
        <p className="text-muted small">
          Generates a random code without saving it, e.g. to pre-print cards.
        </p>
        <GenerateCodeButton length={Number(settings.defaultInviteCodeLength)} />
      </div>
    </div>
  );
}
