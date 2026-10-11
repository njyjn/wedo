"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Navbar } from "react-bootstrap";

export default function NavbarShell({
  brand,
  links,
  account,
}: {
  brand: string;
  links: { href: string; label: string }[];
  account: React.ReactNode;
}) {
  const pathname = usePathname();
  // Section links make no sense in admin pages, or on the thank-you and about pages, which have no sections.
  const showLinks =
    links.length > 0 &&
    !/^\/(god|checkin|thank-you|about)(\/|$)/.test(pathname);
  return (
    <Navbar expand="lg" className="site-nav" sticky="top">
      <Container fluid="xl">
        <Navbar.Brand as={Link} href="/" className="site-brand">
          {brand}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {showLinks && (
            <ul className="navbar-nav site-links">
              {links.map((l) => (
                <li className="nav-item" key={l.href}>
                  <Link className="nav-link" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ul className="navbar-nav align-items-lg-center gap-lg-2 ms-lg-auto site-account">
            {account}
          </ul>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
