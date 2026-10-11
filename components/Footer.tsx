export default function Footer({ text, url }: { text: string; url?: string }) {
  if (!text) return null;
  const safeUrl = url && /^https:\/\//.test(url) ? url : null;
  return (
    <nav id="footer">
      {safeUrl ? (
        <a
          href={safeUrl}
          className="small text-muted"
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ) : (
        <span className="small text-muted">{text}</span>
      )}
    </nav>
  );
}
