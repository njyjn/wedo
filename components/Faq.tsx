import Markdown from "@/components/Markdown";
import type { Settings } from "@/lib/settings";

export default function Faq({ settings }: { settings: Settings }) {
  if (!settings.faq.trim()) return null;
  return (
    <section id="faq" className="section">
      <div className="section-inner section-narrow">
        <p className="eyebrow">Good to know</p>
        <h2 className="section-title">Questions &amp; answers</h2>
        <Markdown className="faq prose">{settings.faq}</Markdown>
      </div>
    </section>
  );
}
