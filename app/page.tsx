import Faq from "@/content/faq";
import Footer from "@/components/Footer";
import RsvpLookupForm from "@/components/RsvpLookupForm";
import Splash from "@/components/Splash";
import { formatDateAndHour } from "@/lib/format";
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

  return (
    <>
      <div className="rsvp-layout">
        <div className="card center text-center border-light">
          <div className="row gx-5 align-items-center">
            <div className="col-sm-6">
              <Splash photos={splashPhotoList(settings)} />
            </div>
            <div className="col-sm-6">
              <div className="card-body">
                <h1 className="signature">
                  <b>{settings.coupleName}</b>
                </h1>
                {event && (
                  <p className="card-text">
                    {formatDateAndHour(event.startTime, settings.timeZone)}
                    <br />
                    {event.location}
                    <br />
                    {event.sublocation}
                  </p>
                )}
                {enableRsvpForm ? (
                  <RsvpLookupForm prefilledCode={prefilledCode} />
                ) : (
                  <i>Save The Date</i>
                )}
              </div>
            </div>
          </div>
        </div>
        <Faq />
      </div>
      <Footer text={settings.footerText} />
    </>
  );
}
