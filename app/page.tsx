import Link from "next/link";
import EventDetails from "@/components/EventDetails";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import RsvpLookupForm from "@/components/RsvpLookupForm";
import ThankYouPage from "@/components/ThankYouPage";
import {
  calendarDaysUntil,
  countdownLabel,
  formatDateLong,
} from "@/lib/format";
import { getDefaultEvent } from "@/lib/event";
import { getSettings, splashPhotoList } from "@/lib/settings";
import { thankYouView } from "@/lib/thank-you";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const settings = await getSettings();
  const event = await getDefaultEvent(settings.defaultEventId);
  const enableRsvpForm = settings.enableRsvpForm === "1";
  const { rsvp } = await searchParams;
  const prefilledCode =
    typeof rsvp === "string" ? rsvp.toUpperCase() : undefined;
  const tz = settings.timeZone;
  const date = event ? formatDateLong(event.startTime, tz) : undefined;
  const daysUntil = event ? calendarDaysUntil(event.startTime, tz) : null;
  const thankYou = thankYouView(settings.thankYouPage, daysUntil);
  if (thankYou === "page")
    return <ThankYouPage settings={settings} event={event} />;

  return (
    <>
      <Hero
        photos={splashPhotoList(settings)}
        eyebrow={settings.heroTagline}
        title={settings.coupleName}
        lines={event ? [date ?? "", event.location ?? ""] : []}
        countdown={daysUntil === null ? null : countdownLabel(daysUntil)}
        action={
          <>
            {enableRsvpForm && (
              <a className="btn btn-primary btn-lg hero-action" href="#rsvp">
                RSVP
              </a>
            )}
            {thankYou === "link" && (
              <Link
                className="btn btn-lg btn-ghost hero-action"
                href="/thank-you"
              >
                A message from us
              </Link>
            )}
          </>
        }
      />

      {event && <EventDetails event={event} settings={settings} />}

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
