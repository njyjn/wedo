"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Navbar } from "react-bootstrap";

const GUEST_LINKS = [
  { href: "/#details", label: "Details" },
  { href: "/#faq", label: "Q & A" },
  { href: "/#rsvp", label: "RSVP" },
];

export default function NavbarShell({
  brand,
  account,
}: {
  brand: string;
  account: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminArea = /^\/(god|checkin)(\/|$)/.test(pathname);
  return (
    <Navbar expand="lg" className="site-nav" sticky="top">
      <Container fluid="xl">
        <Navbar.Brand as={Link} href="/" className="site-brand">
          {brand}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {!isAdminArea && (
            <ul className="navbar-nav mx-lg-auto site-links">
              {GUEST_LINKS.map((l) => (
                <li className="nav-item" key={l.href}>
                  <Link className="nav-link" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ul
            className={`navbar-nav align-items-lg-center gap-lg-2 site-account${isAdminArea ? " ms-lg-auto" : ""}`}
          >
            {account}
          </ul>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
