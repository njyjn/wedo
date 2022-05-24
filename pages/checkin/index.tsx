import React from "react";
import Main from "../../components/Main";
import Checkin from "../../components/Checkin";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Head from "next/head";

const CheckinPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>WeDo | Check In</title>
      </Head>
      <Main>
        <Checkin />
      </Main>
    </>
  );
};

export default withPageAuthRequired(CheckinPage);
