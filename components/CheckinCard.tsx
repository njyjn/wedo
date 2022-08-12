import { Event, Guest, Invite } from "@prisma/client";
import Image from "next/image";
import React, { useState } from "react";
import { Button, Card, ListGroup, ListGroupItem } from "react-bootstrap";

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
  const inviteCode = checkinCard.invite.inviteCode;

  const [checkedInGuests, setCheckedInGuests] = useState<boolean[]>(
    guests.map((g) => g.checkedIn || false)
  );
  const [checkedInGuestCount, setCheckedInGuestCount] = useState<number>(
    checkedInGuests.filter((g) => g).length
  );
  const [isCheckInSuccess, setIsCheckInSuccess] = useState<boolean>(
    checkedInGuestCount > 0 || null
  );
  const [isSubmitting, setSubmitting] = useState(false);

  const checkin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await (
        await fetch(`/api/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inviteCode: inviteCode,
            attendingGuests: guests.map((g, i) => {
              g.checkedIn = checkedInGuests[i];
              return g.id;
            }),
          }),
        })
      ).json();
      if (response["ok"]) {
        setIsCheckInSuccess(true);
      } else {
        setIsCheckInSuccess(false);
      }
    } catch (error) {
      console.error(error);
      setIsCheckInSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="text-center">
      <Card.Body>
        <Card.Title>Welcome!</Card.Title>
        <Card.Text>
          <p>Please find your table assignments below</p>
          <ListGroup className="pb-3">
            {guests
              .filter((g) => g.isAttending)
              .map((g: Guest, i) => {
                return (
                  <ListGroupItem
                    key={g.id + "/" + i}
                    action
                    onClick={() => {
                      checkedInGuests.splice(i, 1, !checkedInGuests[i]);
                      setCheckedInGuests(checkedInGuests);
                      setCheckedInGuestCount(
                        checkedInGuests.filter((g) => g).length
                      );
                    }}
                    active={checkedInGuests[i]}
                  >
                    {g.salutation ? g.salutation + " " : ""}
                    {g.firstName} {g.lastName} (Table{" "}
                    {g.tableId || "not assigned"}){" "}
                    {g.isCorsageRecipient ? "🌺" : ""}
                  </ListGroupItem>
                );
              })}
          </ListGroup>
          <Button
            variant="success"
            disabled={checkedInGuestCount === 0}
            onClick={checkin}
          >
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              (isCheckInSuccess ? "✅ " : "") +
              "Check In (" +
              checkedInGuestCount +
              ")"
            )}
          </Button>
          <Card.Text hidden={isCheckInSuccess !== false}>
            Failed to check in! Please manually record in Prisma
          </Card.Text>
        </Card.Text>
      </Card.Body>
      <Card.Body hidden={!isCheckInSuccess}>
        <Card.Text>
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
