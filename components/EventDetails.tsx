import { formatDateLong, formatTime } from "@/lib/format";
import type { Settings } from "@/lib/settings";

type DetailsEvent = {
  startTime: Date;
  location: string | null;
  sublocation: string | null;
};

/** "When" and "Where" cards, plus the venue map when a Maps key and location are configured. */
export default function EventDetails({
  event,
  settings,
}: {
  event: DetailsEvent;
  settings: Settings;
}) {
  const tz = settings.timeZone;
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  const place = settings.mapQuery.trim() || event.location?.trim() || "";
  return (
    <section id="details" className="section">
      <div className="section-inner">
        <p className="eyebrow">The celebration</p>
        <h2 className="section-title">Details</h2>
        <div className="detail-grid">
          <div className="detail-card">
            <h3 className="detail-label">When</h3>
            <p className="detail-main">{formatDateLong(event.startTime, tz)}</p>
            <p className="detail-sub">{formatTime(event.startTime, tz)}</p>
          </div>
          {event.location && (
            <div className="detail-card">
              <h3 className="detail-label">Where</h3>
              <p className="detail-main">{event.location}</p>
              {event.sublocation && (
                <p className="detail-sub">{event.sublocation}</p>
              )}
              {place && (
                <a
                  className="detail-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                </a>
              )}
            </div>
          )}
        </div>
        {mapsKey && settings.mapQuery.trim() && (
          <iframe
            title="Venue map"
            className="venue-map"
            loading="lazy"
            src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsKey)}&q=${encodeURIComponent(settings.mapQuery.trim())}`}
          />
        )}
      </div>
    </section>
  );
}
