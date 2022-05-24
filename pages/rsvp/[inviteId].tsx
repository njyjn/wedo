import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import InviteCard from "../../components/InviteCard";
import Main from "../../components/Main";
import prisma from "../../lib/prisma";
import invites from "../api/invites";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const inviteId = query.inviteId;
  const invite = await prisma.invite.findUnique({
    include: {
      guests: true,
      event: true,
    },
    where: {
      inviteCode: inviteId.toString(),
    },
  });
  if (!invite) {
    return {
      notFound: true,
    };
  }

  return { props: { invite, event: invite.event, guests: invite.guests } };
};

const InvitePage: React.FC = (props: any) => {
  return (
    <>
      <Head>
        <title>WeDo | RSVP for {props.invite.inviteCode}</title>
      </Head>
      <Main>
        <InviteCard inviteCard={props} showBack={false} />
      </Main>
    </>
  );
};

export default InvitePage;
