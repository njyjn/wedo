import Head from "next/head";
import React from "react";
import Main from "../../components/Main";

const ZoomPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WeDo | Zoom </title>
      </Head>
      <Main>
        <p className="text-center">
          Nice try... This event will not be broadcast :/
        </p>
      </Main>
    </>
  );
};

export default ZoomPage;
