import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import ThankYouNote from "@/components/ThankYouNote";
import { formatDateLong } from "@/lib/format";
import {
  albumLink,
  coupleSignature,
  galleryPhotoList,
  splashPhotoList,
  type Settings,
} from "@/lib/settings";

/** The post-wedding page: cover, the couple's message and the footer, nothing else. */
export default function ThankYouPage({
  settings,
  event,
}: {
  settings: Settings;
  event: { startTime: Date; location: string | null } | null;
}) {
  const photos = galleryPhotoList(settings);
  const album = albumLink(settings);
  const date = event
    ? formatDateLong(event.startTime, settings.timeZone)
    : undefined;
  return (
    <>
      <Hero
        photos={splashPhotoList(settings)}
        eyebrow="Thank you"
        title={settings.coupleName}
        lines={event ? [date ?? "", event.location ?? ""] : []}
        action={
          <a className="btn btn-primary btn-lg hero-action" href="#note">
            Read our note
          </a>
        }
      />
      <section id="note" className="section">
        <div className="section-inner section-narrow">
          <ThankYouNote
            message={settings.thankYouMessage}
            signature={coupleSignature(settings)}
          />
        </div>
      </section>
      {(photos.length > 0 || album) && (
        <section id="photos" className="section">
          <div className="section-inner">
            <p className="eyebrow">Memories</p>
            <h2 className="section-title">Photos</h2>
            {photos.length > 0 && <Gallery photos={photos} />}
            {album && (
              <a
                className="btn btn-primary btn-lg mt-4"
                href={album}
                target="_blank"
                rel="noopener noreferrer"
              >
                See all photos
              </a>
            )}
          </div>
        </section>
      )}
      <Footer
        coupleName={settings.coupleName}
        date={date}
        text={settings.footerText}
        url={settings.footerUrl}
      />
    </>
  );
}
