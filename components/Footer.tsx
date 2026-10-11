export default function Footer({ text }: { text: string }) {
  if (!text) return null;
  return (
    <nav id="footer">
      <a
        href="https://aletheon.co"
        className="small text-muted"
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    </nav>
  );
}
