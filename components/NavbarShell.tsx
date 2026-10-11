"use client";

import Link from "next/link";
import { Container, Navbar } from "react-bootstrap";

export default function NavbarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Navbar expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} href="/" className="mb-0 h1">
          WeDo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">{children}</Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
