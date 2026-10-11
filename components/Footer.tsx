import Link from "next/link";

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
  const external = url && /^https:\/\//.test(url) ? url : null;
  // Paths on this site, such as /about. "//" and "/\" would leave the site, so they don't count.
  const local = url && /^\/(?![/\\])/.test(url) ? url : null;
  return (
    <footer className="site-footer">
      <p className="footer-names signature">{coupleName}</p>
      {date && <p className="footer-date">{date}</p>}
      {text &&
        (external ? (
          <a
            href={external}
            className="footer-note"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        ) : local ? (
          <Link href={local} className="footer-note">
            {text}
          </Link>
        ) : (
          <span className="footer-note">{text}</span>
        ))}
    </footer>
  );
}
