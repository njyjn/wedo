import { Guest, Invite } from ".prisma/client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import moment from "moment";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { Row, Table } from "react-bootstrap";
import Main from "../../../components/Main";
import prisma from "../../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async () => {
  const invites = await prisma.invite.findMany({
    include: {
      guests: true,
    },
    orderBy: [
      {
        attending: "asc",
      },
      {
        respondedAt: "asc",
      },
    ],
  });

  const guestsAttending = await prisma.guest.findMany({
    where: {
      isAttending: true,
    },
    select: {
      isAttending: true,
    },
  });

  return { props: { invites, guestsAttendingCount: guestsAttending.length } };
};

const GodInvites: React.FC = (props: any) => {
  const invites: Invite[] & { guests: Guest[] } = props.invites;
  const guestsAttendingCount = props.guestsAttendingCount;
  return (
    <>
      <Head>
        <title>GOD | Invites</title>
      </Head>
      <Main>
        <Row className="m-3">
          <h3>Invite Management</h3>
          <p>
            Guests Attending: {guestsAttendingCount}
            <br />
            Invites Responded:{" "}
            {
              invites.filter((i) => {
                return i.respondedAt != null;
              }).length
            }
          </p>
          <Table responsive>
            <thead>
              <tr>
                <th>Invite</th>
                <th>Attending</th>
                <th>Responded At</th>
                <th>Primary Contact</th>
                <th>Custom Text</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((i) => {
                const guests: Guest[] = i["guests"];
                let primaryContact: Guest, primaryContactName: string;
                if (guests) {
                  primaryContact = guests.find((g) => {
                    return g.isInviteRecipient;
                  });
                  if (primaryContact) {
                    primaryContactName = `${primaryContact.lastName}, ${primaryContact.firstName}`;
                  }
                }
                const respondedAtFormatted = i.respondedAt
                  ? moment(i.respondedAt).format()
                  : "";
                return (
                  <tr key={i.id}>
                    <td>
                      <code>{i.inviteCode}</code>
                    </td>
                    <td>
                      {i.attending == true
                        ? "Yes"
                        : i.attending == false
                        ? "No"
                        : "Wait"}
                    </td>
                    <td>{respondedAtFormatted}</td>
                    <td>{primaryContactName}</td>
                    <td>{i.customText}</td>
                    <td>{i.recipientNotes}</td>
                    <td>
                      <Link href={`/god/invites/${i.inviteCode}`}>💌</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Row>
      </Main>
    </>
  );
};

export default withPageAuthRequired(GodInvites);
