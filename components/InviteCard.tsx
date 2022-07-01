import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Event, Guest, Invite } from "@prisma/client";
import "moment";
import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Form,
  ListGroup,
  Modal,
} from "react-bootstrap";
import { printFormalName } from "../lib/utils";
import { Faq } from "./Faq";

export type InviteCardProps = {
  invite?: Invite;
  event?: Event;
  guests?: Guest[];
  notFound?: boolean;
};

const InviteCard: React.FC<{
  inviteCard: InviteCardProps;
  showFaq?: boolean;
  showBack?: boolean;
}> = ({ inviteCard, showFaq = true, showBack = true }) => {
  const router = useRouter();
  const invite: Invite = inviteCard.invite as Invite;
  const event: Event = inviteCard.event as Event;
  const guests = inviteCard.guests as Guest[];
  const msg =
    "We look forward to seeing you on our very special day! Kindly RSVP below. Thank you.";
  const [dietaryRequirements, setDietaryRequirements] = useState("");
  const [recipientNotes, setRecipientNotes] = useState(invite.recipientNotes);
  const [attendingGuests, setAttendingGuests] = useState<boolean[]>(
    guests.map((g) => g.isAttending || false)
  );
  const [attendingGuestCount, setAttendingGuestCount] = useState<number>(
    attendingGuests.filter((g) => g).length
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAttending, setIsAttending] = useState(null);

  const [hasError, setHasError] = useState(false);

  const hcaptchaRef = useRef(null);

  const [responseModalText, setResponseModalText] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
    setHasError(false);
  };
  const handleShowModal = () => setShowModal(true);

  const [rsvpWindowClosed, setRsvpWindowClosed] = useState(false);
  useEffect(() => {
    try {
      setRsvpWindowClosed(new Date(invite.respondBy) < new Date());
    } catch (e) {
      console.warn("Invite respondBy invalid. Defaulting to event start time");
      event.startTime;
      setRsvpWindowClosed(new Date(event.startTime) < new Date());
    }
    return () => {
      setRsvpWindowClosed(false);
    };
  }, [event.startTime, invite.respondBy]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [responseModalText]);

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsAttending(true);
    hcaptchaRef.current.execute();
  };

  const notAttending = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsAttending(false);
    hcaptchaRef.current.execute();
  };

  const onHCaptchaChange = async (captchaCode) => {
    if (!captchaCode) {
      alert("Please submit again with the captcha");
      setIsSubmitting(false);
      return;
    }
    let modalText: string;
    if (isAttending) {
      try {
        if (attendingGuestCount < 1) {
          modalText =
            'Please indicate which guests are attending. If not, select "Not Attending"';
          setHasError(true);
        } else {
          const attending = guests.map((g, i) => {
            g.isAttending = attendingGuests[i];
            return g;
          });
          const body = {
            id: invite.id,
            attendingGuests: attending,
            recipientNotes: recipientNotes,
            dietaryRequirements: dietaryRequirements,
            attending: true,
            captcha: captchaCode,
          };
          const response = await fetch("/api/rsvp", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (response.ok) {
            modalText = "Thanks for your response. See you there!";
            setHasError(false);
          } else {
            modalText =
              "We have received your response but something went wrong in the backend. Please let your host know directly. Thank you";
            setHasError(true);
          }
        }
      } catch (error) {
        console.error(error);
        modalText =
          "Something went wrong, please contact your host for assistance";
        setHasError(true);
      }
    } else {
      try {
        const attending = guests.map((g, i) => {
          g.isAttending = false;
          return g;
        });
        const body = {
          id: invite.id,
          attendingGuests: attending,
          recipientNotes: recipientNotes,
          dietaryRequirements: dietaryRequirements,
          attending: false,
          captcha: captchaCode,
        };
        const response = await fetch("/api/rsvp", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          modalText =
            "Thank you for letting us know. We'll catch up another time!";
          setHasError(false);
        } else {
          modalText =
            "We have received your response but something went wrong in the backend. Please let your host know directly. Thank you";
          setHasError(true);
        }
      } catch (error) {
        console.error(error);
        modalText =
          "Something went wrong, please contact your host for assistance";
        setHasError(true);
      }
    }
    setResponseModalText(modalText);
    handleShowModal();
    setIsSubmitting(false);
  };

  const back = () => {
    setIsSubmitting(true);
    router.reload();
  };

  const recipientTitle = printFormalName(guests);

  return (
    <div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{hasError ? "Oops!" : "All set!"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{responseModalText}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Edit response
          </Button>
          {hasError ? (
            <></>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                // showBack flag is set to False for /rsvp component
                if (showBack) {
                  router.reload();
                } else {
                  router.push("/");
                }
              }}
            >
              Go to homepage
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Card>
        <Card.Header>
          Invite Code <code>{invite.inviteCode.toUpperCase()}</code>
        </Card.Header>
        <Card.Body>
          <Card.Title>Dearest {recipientTitle}</Card.Title>
          <Card.Text>
            <p>
              Together with our families, we cordially invite you to{" "}
              <b>{event.name}</b>.
            </p>
            <p>
              Date:{" "}
              {moment(event.startTime).format("dddd, MMMM Do YYYY, h:mma")}.
              Please refer to the FAQs below for the full program details.
              <br />
              Venue: {event.location} ({event.sublocation})<br />
            </p>
            <p>
              Please respond latest{" "}
              <b>
                by{" "}
                {invite.respondBy
                  ? moment(invite.respondBy)?.format("dddd, MMMM Do YYYY")
                  : "July 1st 2022"}{" "}
              </b>
              so that we can finalize our guestlist for submission to the venue.
              Kindly note that you are required to be fully vaccinated to attend
              the event according to current VDS regulations.
            </p>
            <p>{invite.customText || msg}</p>
            <p>With gratitude,</p>
            <h3 className="signature">Justin Ng & Alethea Sim</h3>
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush" />
        {rsvpWindowClosed ? (
          <Card.Body>
            <Card.Subtitle className="center">
              RSVP Window Closed on{" "}
              {moment(invite.respondBy).format("MMM Do YYYY")}
            </Card.Subtitle>
            <Card.Text>
              <p>
                Your response was:{" "}
                <b>{invite.attending ? "Attending" : "Not Attending"}</b>
              </p>
              <p>
                Please contact the couple if you have to make any changes.
                Contact information can be found in the FAQ below.
              </p>
            </Card.Text>
          </Card.Body>
        ) : (
          <Card.Body>
            <Form onSubmit={submit}>
              <HCaptcha
                id="rsvp"
                size="invisible"
                ref={hcaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                onVerify={onHCaptchaChange}
              />
              <Form.Group className="mb-3">
                <Form.Label>Attending ({attendingGuestCount})</Form.Label>
                {guests.map((g: Guest, i) => (
                  <Form.Check
                    key={g.id + "/" + i}
                    type="checkbox"
                    id={`guest-checkbox-${i}-${g.id}`}
                    label={g.firstName + " " + g.lastName}
                    checked={attendingGuests[i]}
                    onChange={() => {
                      attendingGuests.splice(i, 1, !attendingGuests[i]);
                      setAttendingGuests(attendingGuests);
                      setAttendingGuestCount(
                        attendingGuests.filter((g) => g).length
                      );
                    }}
                  />
                ))}
                <Form.Text></Form.Text>
              </Form.Group>
              <Form.Group hidden className="mb-3">
                <Form.Label>Dietary Restrictions</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Shellfish, seafood, halal, etc. (optional)"
                  // autoFocus
                  onChange={(e) => setDietaryRequirements(e.target.value)}
                  value={dietaryRequirements}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message to the couple</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter message (optional)"
                  // autoFocus
                  onChange={(e) => setRecipientNotes(e.target.value)}
                  value={recipientNotes}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  I/my guests and I agree to be subject to all prevailing
                  COVID-19 measures laid out by the authorities, including
                  abiding by VDS entry requirements and adhering to all safe
                  management measures. Please click{" "}
                  <a
                    href="https://www.gobusiness.gov.sg/covid-19-faqs/for-sector-specific-queries/marriage-solemnizations-and-receptions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                  </a>{" "}
                  for the latest government regulations.
                </Form.Label>
                <Form.Check required type="checkbox" label="Agree" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Text>
                  You may make changes to your response at any time before the
                  RSVP deadline. If there are any changes to your response after
                  this date, please contact the couple (WhatsApp: +65 8044
                  2624), Justin (+65 9655 6795) or Alethea (+65 8383 4264). This
                  form will not be accessible after the stipulated deadline.
                  Thank you for your understanding.
                </Form.Text>
              </Form.Group>
              <ButtonGroup className="d-grid gap-2">
                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Please wait..." : "Attending"}
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  onClick={notAttending}
                  hidden={isSubmitting}
                >
                  Unable to Attend
                </Button>
                <Button
                  variant="light"
                  type="button"
                  onClick={back}
                  hidden={!showBack || isSubmitting}
                >
                  Back
                </Button>
              </ButtonGroup>
            </Form>
          </Card.Body>
        )}
      </Card>
      <Faq hidden={!showFaq} />
    </div>
  );
};

export default InviteCard;
