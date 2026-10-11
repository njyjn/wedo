import Link from "next/link";
import { getAdminStatus } from "@/lib/auth";
import NavbarShell from "@/components/NavbarShell";
import type { ThankYouView } from "@/lib/thank-you";

const SECTION_LINKS = [
  { href: "/#details", label: "Details" },
  { href: "/#rsvp", label: "RSVP" },
  { href: "/#faq", label: "Q & A" },
];

export default async function Header({
  coupleName,
  thankYou,
}: {
  coupleName: string;
  thankYou: ThankYouView;
}) {
  const { user, isAdmin } = await getAdminStatus();
  return (
    <NavbarShell
      brand={coupleName}
      links={
        thankYou === "page"
          ? []
          : thankYou === "link"
            ? [...SECTION_LINKS, { href: "/thank-you", label: "Thank you" }]
            : SECTION_LINKS
      }
      account={
        <>
          {isAdmin && (
            <li className="nav-item">
              <Link className="nav-link" href="/god">
                God
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li className="nav-item">
                <span className="navbar-text">
                  {user.nickname || user.name || user.email}
                </span>
              </li>
              <li className="nav-item">
                {/* Must be a plain <a>: /auth/* routes are handled by the proxy, not the router. */}
                <a className="nav-link" href="/auth/logout">
                  Logout
                </a>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <a className="nav-link" href="/auth/login?returnTo=/god">
                God
              </a>
            </li>
          )}
        </>
      }
    />
  );
}
