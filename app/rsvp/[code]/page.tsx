import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import EventDetails from "@/components/EventDetails";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Markdown from "@/components/Markdown";
import RsvpForm from "@/components/RsvpForm";
import ThankYouNote from "@/components/ThankYouNote";
import {
  calendarDaysUntil,
  countdownLabel,
  formatCalendarDate,
  formatDateLong,
  formatDateTimeLong,
} from "@/lib/format";
import { normalizeInviteCode } from "@/lib/invite-code";
import { printFormalName } from "@/lib/names";
import prisma from "@/lib/prisma";
import { isRsvpClosed, rsvpClosesAt } from "@/lib/rsvp";
import { coupleSignature, getSettings, splashPhotoList } from "@/lib/settings";
import { thankYouView } from "@/lib/thank-you";

// Only what the guest needs to see. Never select phone numbers, emails or table assignments here:
// anyone holding (or guessing) the invite code can load this page.
const getInvite = cache((code: string) =>
  prisma.invite.findUnique({
    where: { inviteCode: code },
    select: {
      inviteCode: true,
      attending: true,
      respondBy: true,
      recipientNotes: true,
      customText: true,
      event: {
        select: {
          name: true,
          startTime: true,
          location: true,
          sublocation: true,
        },
      },
      guests: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          salutation: true,
          isInviteRecipient: true,
          isAttending: true,
        },
        orderBy: { id: "asc" },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: PageProps<"/rsvp/[code]">): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `RSVP for ${normalizeInviteCode(decodeURIComponent(code))}`,
    robots: { index: false },
  };
}

export default async function InvitePage({
  params,
}: PageProps<"/rsvp/[code]">) {
  const code = normalizeInviteCode(decodeURIComponent((await params).code));
  const [invite, settings] = await Promise.all([
    getInvite(code),
    getSettings(),
  ]);
  if (!invite || !invite.inviteCode) notFound();

  const { event, guests } = invite;
  const tz = settings.timeZone;
  const closed = isRsvpClosed(invite.respondBy, event.startTime, tz);
  const respondBy = invite.respondBy
    ? formatCalendarDate(invite.respondBy, tz)
    : formatDateLong(event.startTime, tz);
  const signature = coupleSignature(settings);
  const showNote =
    thankYouView(
      settings.thankYouPage,
      calendarDaysUntil(event.startTime, tz),
    ) !== null;

  return (
    <>
      <Hero
        compact
        photos={splashPhotoList(settings)}
        eyebrow="You're invited"
        title={settings.coupleName}
        lines={[formatDateLong(event.startTime, tz), event.location ?? ""]}
        countdown={countdownLabel(calendarDaysUntil(event.startTime, tz))}
      />

      <section className="section">
        <div className="section-inner section-narrow">
          {showNote && (
            <ThankYouNote
              message={settings.thankYouMessage}
              signature={signature}
            />
          )}
          <article className="paper invitation">
            <p className="invitation-greeting">
              Dearest {printFormalName(guests)},
            </p>
            <p>
              Together with our families, we joyfully invite you to{" "}
              <b>{event.name}</b>.
            </p>
            <dl className="invitation-facts">
              <div>
                <dt>When</dt>
                <dd>{formatDateTimeLong(event.startTime, tz)}</dd>
              </div>
              {event.location && (
                <div>
                  <dt>Where</dt>
                  <dd>
                    {event.location}
                    {event.sublocation ? `, ${event.sublocation}` : ""}
                  </dd>
                </div>
              )}
            </dl>
            <Markdown>{settings.inviteNotice}</Markdown>
            {invite.customText ? (
              <p>{invite.customText}</p>
            ) : (
              <Markdown>{settings.inviteMessage}</Markdown>
            )}
            <p className="invitation-closing">With gratitude,</p>
            <p className="signature invitation-signature">{signature}</p>
          </article>

          <div id="rsvp" className="paper rsvp-card">
            <p className="eyebrow text-center">Kindly reply</p>
            <h2 className="section-title text-center">Will you join us?</h2>
            {closed ? (
              <div className="text-center">
                <p className="section-lede">
                  RSVPs closed on{" "}
                  {formatDateLong(
                    rsvpClosesAt(invite.respondBy, event.startTime, tz),
                    tz,
                  )}
                  .
                </p>
                <p>
                  Your response:{" "}
                  <b>
                    {invite.attending === null
                      ? "No response"
                      : invite.attending
                        ? "Attending"
                        : "Not attending"}
                  </b>
                </p>
                <p className="text-muted small mb-0">
                  Please contact the couple if you need to make any changes.
                  Contact details are in the Q &amp; A below.
                </p>
              </div>
            ) : (
              <>
                <p className="section-lede text-center">
                  Please respond by <b>{respondBy}</b>.
                </p>
                <RsvpForm
                  code={invite.inviteCode}
                  recipientNotes={invite.recipientNotes ?? ""}
                  agreement={
                    settings.rsvpAgreement.trim() ? (
                      <Markdown>{settings.rsvpAgreement}</Markdown>
                    ) : null
                  }
                  changePolicy={
                    <Markdown>{settings.rsvpChangePolicy}</Markdown>
                  }
                  guests={guests.map((g) => ({
                    id: g.id,
                    name: `${g.firstName} ${g.lastName}`,
                    isAttending: g.isAttending,
                  }))}
                />
              </>
            )}
            <p className="invite-code">
              Invite code <code>{invite.inviteCode}</code>
            </p>
          </div>
        </div>
      </section>

      <EventDetails event={event} settings={settings} />
      <Faq settings={settings} />
      <Footer
        coupleName={settings.coupleName}
        date={formatDateLong(event.startTime, tz)}
        text={settings.footerText}
        url={settings.footerUrl}
      />
    </>
  );
}
