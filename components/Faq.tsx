import Markdown from "@/components/Markdown";
import type { Settings } from "@/lib/settings";

export default function Faq({ settings }: { settings: Settings }) {
  const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
  const mapQuery = settings.mapQuery.trim();
  if (!settings.faq.trim() && !(mapsKey && mapQuery)) return null;
  return (
    <div className="faq-layout">
      <h4 className="center">Frequently Asked Questions</h4>
      <Markdown className="faq">{settings.faq}</Markdown>
      {mapsKey && mapQuery && (
        <p className="center">
          <iframe
            title="Venue map"
            className="map"
            loading="lazy"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsKey)}&q=${encodeURIComponent(mapQuery)}`}
          />
        </p>
      )}
    </div>
  );
}
