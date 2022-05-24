import { Event, Guest, Invite } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { Card, ListGroup, ListGroupItem } from "react-bootstrap";

export type CheckinCardProps = {
  invite?: Invite;
  event?: Event;
  guests?: Guest[];
  notFound?: boolean;
};

const CheckinCard: React.FC<{ checkinCard: CheckinCardProps }> = ({
  checkinCard,
}) => {
  const guests = checkinCard.guests as Guest[];
  return (
    <Card className="text-center">
      <Card.Body>
        <Card.Title>
          Welcome, {guests.find((g) => g.isInviteRecipient)?.lastName} family
        </Card.Title>
        <Card.Text>
          <p>Please find your table assignments below</p>
          <ListGroup className="pb-3">
            {guests.map((g) => {
              return (
                <ListGroupItem key={g.id}>
                  {g.firstName} {g.lastName} (Table{" "}
                  {g.tableId || "not assigned"})
                </ListGroupItem>
              );
            })}
          </ListGroup>
          <p>We hope you have a splendid time!</p>
          <p>Your blessings are greatly appreciated</p>
          <Image src="/qr.png" alt="paynow-qr" width={256} height={256} />
          <p>With gratitude and love,</p>
          <h1 className="signature">Justin & Alethea</h1>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CheckinCard;
