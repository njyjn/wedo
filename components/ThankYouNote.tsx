import Markdown from "@/components/Markdown";

/** The couple's post-wedding message, styled like the invitation card. */
export default function ThankYouNote({
  message,
  signature,
}: {
  message: string;
  signature: string;
}) {
  return (
    <article className="paper thank-you-note">
      <p className="eyebrow text-center">A message from the couple</p>
      <Markdown className="thank-you-message">{message}</Markdown>
      <p className="signature invitation-signature text-center">{signature}</p>
    </article>
  );
}
