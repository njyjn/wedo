import { useUser } from "@auth0/nextjs-auth0";
import React from "react";
import {
  Container,
  Dropdown,
  DropdownButton,
  Nav,
  Navbar,
} from "react-bootstrap";

const Header: React.FC = () => {
  const { user, error, isLoading } = useUser();

  return (
    <Navbar expand="lg">
      <Container fluid>
        <Navbar.Brand className="mb-0 h1" href="/">
          WeDo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* <Nav className="me-auto">
            <Nav.Link href="/about">About</Nav.Link>
          </Nav> */}
          {!isLoading && !error && user ? (
            <Nav className="ms-auto">
              <DropdownButton
                variant="light"
                align="end"
                title={user.nickname || user.name || user.email}
                id="collasible-nav-dropdown"
              >
                <Dropdown.Item href="/god">God</Dropdown.Item>
                <Dropdown.Item href="/api/auth/logout">Logout</Dropdown.Item>
              </DropdownButton>
            </Nav>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link href="/god">God</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
