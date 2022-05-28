import { Invite, Guest, Event } from ".prisma/client";
import { GetServerSideProps } from "next";
import { useRef, useEffect, useState, useMemo } from "react";
import { Form, FormControl, Row } from "react-bootstrap";
import Main from "../../../components/Main";
import prisma from "../../../lib/prisma";
import moment from "moment";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import QRCode from "qrcode";
import Link from "next/link";
import Head from "next/head";
import { printFormalName } from "../../../lib/utils";

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

const InviteRsvpPage: React.FC = (props: any) => {
  const invite: Invite = props.invite;
  const guests: Guest[] = props.guests;
  const event: Event = props.event;
  const recipient = guests.find((g) => {
    return g.isInviteRecipient;
  });
  const recipientFullName = recipient.firstName + " " + recipient.lastName;
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [recipientText, setRecipientText] = useState(printFormalName(guests));

  const canvas = useRef<HTMLCanvasElement>();
  const image = useRef<HTMLImageElement>();
  const qr = useRef<HTMLImageElement>();

  useMemo(() => {
    image.current = new Image();
    image.current.src = "/rsvp-template.png";
    qr.current = new Image();
    QRCode.toDataURL(`https://wedo.sg/rsvp/${invite.inviteCode}`).then(
      (url) => (qr.current.src = url)
    );
  }, [invite.inviteCode]);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    image.current.onload = () => {
      setLoading(false);
    };
    if (!loading) {
      ctx.drawImage(
        image.current,
        0,
        0,
        canvas.current.width,
        canvas.current.height
      );
      ctx.textAlign = "center";
      ctx.font = "45px Helvetica";
      ctx.fillText(recipientText, 620, 665, 1100);
      ctx.fillText(moment(invite.respondBy).format("MMM DD YYYY"), 605, 1650);
      ctx.font = "45px Courier";
      ctx.fillText(invite.inviteCode, 605, 1525);
      ctx.drawImage(qr.current, 890, 1410, 325, 325);
      setDownloadUrl(canvas.current.toDataURL());
    }

    return () => {};
  }, [recipientText, image, invite.inviteCode, invite.respondBy, qr, loading]);

  const attendingGuests = guests.filter((g) => g.isAttending);

  return (
    <>
      <Head>
        <title>GOD | Invite {invite.inviteCode}</title>
      </Head>
      <Main>
        <Row className="m-3">
          <Link href="/god/invites">
            <h3>Invite Management</h3>
          </Link>
          <b>{invite.inviteCode}</b>
          <p>
            Event: {event.name}
            <br />
            Type: {invite.type}
            <br />
            Recipient: {recipientFullName} ({recipient.phoneNumber})
          </p>
          <h5>Response</h5>
          <p>
            {invite.attending === null
              ? "Not responded"
              : invite.attending
              ? `Attending (${guests.filter((g) => g.isAttending).length})`
              : "Not Attending"}
          </p>
          <p>
            <ul>
              {attendingGuests.map((g) => {
                return (
                  <li key={g.id}>
                    {g.firstName} {g.lastName}
                  </li>
                );
              })}
            </ul>
          </p>
          <p>
            <b>Message: </b>
            {invite.recipientNotes || "None"}
          </p>
          <h5>Suggested Accompanying Text</h5>
          <pre>
            <p>Dear {recipientText}:</p>
            <p>
              Kindly RSVP at{" "}
              <a href={`https://wedo.sg/rsvp/${invite.inviteCode}`}>
                https://wedo.sg/rsvp/{invite.inviteCode}
              </a>{" "}
              by {moment(invite.respondBy).format("MMM Do YYYY")}.
            </p>
            <p>Thank you and we hope to see you there!</p>
            <p>Regards, Justin Ng &amp; Alethea Sim</p>
          </pre>
        </Row>
        <Row className="m-3">
          <h5>Image</h5>
          <Form>
            <Form.Label htmlFor="inlineFormInputRt">
              Modify Recipient Text
            </Form.Label>
            <Form.Control
              className="mb-2"
              id="inlineFormInputRt"
              value={recipientText}
              onChange={(e) => setRecipientText(e.target.value)}
            />
          </Form>
          <a
            className="center"
            href={downloadUrl}
            download={`rsvp-${invite.inviteCode}.png`}
          >
            Download
          </a>
          <canvas
            ref={canvas}
            width="1240"
            height="1748"
            style={{ border: "1px solid #000000" }}
          />
        </Row>
      </Main>
    </>
  );
};

export default withPageAuthRequired(InviteRsvpPage);
