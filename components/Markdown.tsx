import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders admin-authored Markdown. Raw HTML is not rendered, and react-markdown's default URL
 * transform drops unsafe protocols such as javascript:.
 */
export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  if (!children.trim()) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary hosts from admin content
            <img
              src={typeof src === "string" ? src : undefined}
              alt={alt ?? ""}
              className="img-fluid"
            />
          ),
          table: ({ children }) => (
            <table className="table table-bordered timetable">{children}</table>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
