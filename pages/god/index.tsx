import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import { Button } from "react-bootstrap";
import Main from "../../components/Main";
import { getFeature } from "../../lib/feature";
import prisma from "../../lib/prisma";
import { generateInviteCode } from "../../lib/utils";

export const getStaticProps: GetStaticProps = async () => {
  const features = await prisma.feature.findMany();
  return { props: { features } };
};

const God: React.FC = (props: any) => {
  return (
    <>
      <Head>
        <title>GOD</title>
      </Head>
      <Main>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            alt="it's god"
            src="https://media.giphy.com/media/4Ez11VM31gFry/giphy.gif"
            width={100}
            height={100}
            layout="fixed"
          />
        </div>
        <h1 className="pt-3 center signature">Good Old Dashboard&trade;</h1>
        {/* <p className="center"><i>Who did you say I was?</i></p> */}
        <div className="d-grid gap-2 px-3">
          <Button href="/checkin" variant="light">
            🛂 Check In
          </Button>
          <Button
            onClick={() =>
              alert(
                generateInviteCode(
                  parseInt(
                    getFeature("defaultInviteCodeLength", props.features)
                  )
                )
              )
            }
            variant="light"
          >
            🏷 Generate Invite Code
          </Button>
          <Button href="/god/guests" variant="light">
            👫 Guest Management
          </Button>
          <Button href="/god/invites" variant="light">
            💌 Invite Management
          </Button>
          <Button
            href={getFeature("prismaClientUrl", props.features)}
            target="_blank"
            rel="noreferrer noopener"
            variant="light"
          >
            🌈 Prisma
          </Button>
          <Button href="/god/settings" variant="light">
            🔧 Settings
          </Button>
        </div>
      </Main>
    </>
  );
};

export default withPageAuthRequired(God);
