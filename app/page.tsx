import EventDetails from "@/components/EventDetails";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import RsvpLookupForm from "@/components/RsvpLookupForm";
import {
  calendarDaysUntil,
  countdownLabel,
  formatDateLong,
} from "@/lib/format";
import prisma from "@/lib/prisma";
import { getSettings, splashPhotoList } from "@/lib/settings";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const settings = await getSettings();
  const eventId = Number.parseInt(settings.defaultEventId, 10);
  const event = Number.isSafeInteger(eventId)
    ? await prisma.event.findUnique({
        where: { id: eventId },
        select: { startTime: true, location: true, sublocation: true },
      })
    : null;
  const enableRsvpForm = settings.enableRsvpForm === "1";
  const { rsvp } = await searchParams;
  const prefilledCode =
    typeof rsvp === "string" ? rsvp.toUpperCase() : undefined;
  const tz = settings.timeZone;
  const date = event ? formatDateLong(event.startTime, tz) : undefined;

  return (
    <>
      <Hero
        photos={splashPhotoList(settings)}
        eyebrow={settings.heroTagline}
        title={settings.coupleName}
        lines={event ? [date ?? "", event.location ?? ""] : []}
        countdown={
          event ? countdownLabel(calendarDaysUntil(event.startTime, tz)) : null
        }
        action={
          enableRsvpForm && (
            <a className="btn btn-primary btn-lg hero-action" href="#rsvp">
              RSVP
            </a>
          )
        }
      />

      <section id="rsvp" className="section">
        <div className="section-inner section-narrow text-center">
          {enableRsvpForm ? (
            <>
              <p className="eyebrow">Kindly reply</p>
              <h2 className="section-title">RSVP</h2>
              <p className="section-lede">
                Enter the invite code from your invitation to find your
                reservation.
              </p>
              <RsvpLookupForm prefilledCode={prefilledCode} />
            </>
          ) : (
            <>
              <p className="eyebrow">Mark your calendar</p>
              <h2 className="section-title">Save the date</h2>
              <p className="section-lede">Formal invitation to follow.</p>
            </>
          )}
        </div>
      </section>

      {event && <EventDetails event={event} settings={settings} />}
      <Faq settings={settings} />
      <Footer
        coupleName={settings.coupleName}
        date={date}
        text={settings.footerText}
        url={settings.footerUrl}
      />
    </>
  );
}
