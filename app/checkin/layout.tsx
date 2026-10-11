// Presentation only: every page and action under here still calls requireAdmin() itself.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container-fluid py-4 admin-shell">{children}</div>;
}
