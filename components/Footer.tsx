import React from "react";
import { useRouter } from "next/router";
import { Nav } from "react-bootstrap";

export type FooterProps = {
  text?: string;
};

const Footer: React.FC<{ text: string }> = ({ text }) => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  let center = (
    <div>
      <a
        href="https://aletheon.co"
        className="small text-muted"
        data-active={isActive("/")}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    </div>
  );

  return <Nav id="footer">{center}</Nav>;
};

export default Footer;
