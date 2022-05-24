import Head from "next/head";
import React, { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Main: React.FC<Props> = (props) => (
  <Container fluid>
    <Header />
    {props.children}
  </Container>
);

export default Main;
