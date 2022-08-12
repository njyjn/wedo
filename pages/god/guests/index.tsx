import { Guest, Invite, Table as GuestTable, Feature } from ".prisma/client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from "next";
import React from "react";
import { Row, Table } from "react-bootstrap";
import Main from "../../../components/Main";
import {
  QuickAddGuest,
  QuickAssignTableInvite,
  QuickGenerateInvite,
} from "../../../components/QuickAdd";
import prisma from "../../../lib/prisma";
import { CSVLink } from "react-csv";
import Head from "next/head";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async () => {
  const guests = await prisma.guest.findMany({
    include: {
      invite: true,
    },
    orderBy: [
      {
        tableId: "asc",
      },
      {
        invite: {
          inviteCode: "asc",
        },
      },
      {
        lastName: "asc",
      },
      {
        firstName: "asc",
      },
    ],
  });
  const tables = await prisma.table.findMany({
    include: {
      guests: true,
    },
  });
  const invites = await prisma.invite.findMany({
    include: {
      guests: true,
    },
    orderBy: [
      {
        inviteCode: "asc",
      },
    ],
  });
  const features = await prisma.feature.findMany({});
  return { props: { guests, tables, invites, features } };
};

const GodGuests: React.FC = (props: any) => {
  const guests: Guest[] = props.guests;
  const tables: GuestTable[] = props.tables;
  const sortedTables = tables.sort((tA, tB) => tA.id - tB.id);
  const invites: Invite[] = props.invites;
  const features: Feature[] = props.features;
  const quickAddProps = {
    guests: guests,
    invites: invites,
    tables: tables,
    features: features,
  };
  let maxTableSize = 0;
  let csvData = tables
    .sort((t1, t2) => t1.id - t2.id)
    .map((t) => {
      const guests: Guest[] = t["guests"];
      if (guests.length > maxTableSize) {
        maxTableSize = guests.length;
      }
      const tableName = (t.isVip ? "VIP " : "") + t.id;
      return [
        guests.length,
        tableName,
        ...guests
          .filter((g) => g.isAttending)
          .map((g) =>
            [g.firstName, g.lastName, g.isChild ? "(C)" : null].join(" ").trim()
          ),
      ];
    });
  csvData = [...Array(maxTableSize + 2)].map((_, i) =>
    csvData.map((r) => r[i])
  );
  return (
    <>
      <Head>
        <title>GOD | Guests </title>
      </Head>
      <Main>
        <Row className="m-3">
          <h3>Guest Management</h3>
          <p>
            Attending/Count: {guests.filter((g) => g.isAttending).length}/
            {guests.filter((g) => g.isAttending !== false).length}
          </p>
          <QuickAddGuest />
          <QuickAssignTableInvite quickAdd={quickAddProps} />
          <QuickGenerateInvite quickAdd={quickAddProps} />
          <p>
            <i>For other CRUD, use Prisma Studio</i>
          </p>
          <Table hover className="text-center" responsive>
            <thead>
              <tr>
                {sortedTables.map((t) => {
                  return <th key={t.id}>{t.id}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {sortedTables.map((t) => {
                  return (
                    <td key={t.id}>
                      {
                        guests.filter((g) => {
                          return g.tableId === t.id && g.isAttending;
                        }).length
                      }
                      /
                      {
                        guests.filter((g) => {
                          return g.tableId === t.id;
                        }).length
                      }
                      /{t.maxPax}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </Table>
          <CSVLink
            data={csvData}
            filename={"justin-and-alethea-guests.csv"}
            className="btn btn-light mb-3 text-center"
            target="_blank"
          >
            📤 Export as CSV
          </CSVLink>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Table</th>
                <th>Invite Code</th>
                <th>R/A</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => {
                const invite: Invite = g["invite"];
                return (
                  <tr
                    key={g.id}
                    style={{
                      backgroundColor: `${
                        g.tableId && g.tableId % 2 === 0 ? "beige" : ""
                      }`,
                    }}
                  >
                    <td>
                      {g.lastName}, {g.firstName}
                      {g.isChild ? " 👶🏻" : ""}
                      {g.isInviteRecipient ? " 💌" : ""}
                      {g.isCorsageRecipient ? " 🌺" : ""}
                      {g.salutation ? ` (${g.salutation})` : ""}
                    </td>
                    <td>{g.phoneNumber}</td>
                    <td>{g.tableId}</td>
                    <td>
                      <Link href={`/god/invites/${invite?.inviteCode}`}>
                        <code>{invite?.inviteCode}</code>
                      </Link>
                    </td>
                    <td>
                      {g.checkedIn
                        ? "Seated"
                        : g.isAttending == null
                        ? "Wait"
                        : g.isAttending === true
                        ? "Yes"
                        : "No"}
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

export default withPageAuthRequired(GodGuests);
