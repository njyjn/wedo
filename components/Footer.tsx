export default function Footer({
  coupleName,
  date,
  text,
  url,
}: {
  coupleName: string;
  date?: string;
  text: string;
  url?: string;
}) {
  const safeUrl = url && /^https:\/\//.test(url) ? url : null;
  return (
    <footer className="site-footer">
      <p className="footer-names signature">{coupleName}</p>
      {date && <p className="footer-date">{date}</p>}
      {text &&
        (safeUrl ? (
          <a
            href={safeUrl}
            className="footer-note"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : (
          <span className="footer-note">{text}</span>
        ))}
    </footer>
  );
}
