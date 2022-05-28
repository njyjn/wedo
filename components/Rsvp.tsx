import moment from "moment";
import { useRouter } from "next/router";
import React, { useState, useRef } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Toast,
  ToastBody,
  ToastContainer,
} from "react-bootstrap";
import InviteCard, { InviteCardProps } from "./InviteCard";
import { Splash } from "./Splash";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Faq } from "./Faq";

export type RsvpProps = {
  eventStartTime?: Date;
  eventLocation?: String;
  eventSublocation?: String;
  coupleName?: String;
  enableRsvpForm?: boolean;
  splashPhotos: string[];
};

const Rsvp: React.FC<{ rsvpProps: RsvpProps }> = ({ rsvpProps }) => {
  const router = useRouter();
  const prefilledInviteCode =
    router.query["rsvp"]?.toString()?.toUpperCase() || undefined;
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCard, setInviteCard] = useState<InviteCardProps>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hcaptchaRef = useRef(null);

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      hcaptchaRef.current.execute();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onHCaptchaChange = async (captchaCode) => {
    if (!captchaCode) {
      alert("Please submit again with the captcha");
      setIsLoading(false);
      return;
    }
    validate(captchaCode);
  };

  const validate = async (captchaCode) => {
    try {
      const code = prefilledInviteCode || inviteCode;
      const body = { inviteCode: code, captcha: captchaCode };
      const response = await (
        await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).json();
      if (response["error"]) {
        throw new Error(`Invite code ${inviteCode} not found`);
      }
      setInviteCard({
        invite: response,
        event: response["event"],
        guests: response["guests"],
      });
      router.push("/");
    } catch (error) {
      console.error(error);
      setInviteCard({
        notFound: true,
      });
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toast = (
    <ToastContainer className="p-3" position="top-end" hidden>
      <Toast
        onClose={() => setError(false)}
        animation
        autohide
        delay={10000}
        show={error}
      >
        <ToastBody style={{ textAlign: "center" }}>
          Please try again or contact the host for assistance
        </ToastBody>
      </Toast>
    </ToastContainer>
  );
  const retriever = (
    <Card className="center text-center border-light">
      <Row className="gx-5 align-items-center">
        <Col sm={6}>
          <Splash photos={rsvpProps.splashPhotos} />
        </Col>
        <Col sm={6}>
          <Card.Body>
            <h1 className="signature">
              <b>{rsvpProps.coupleName || "WeDo"}</b>
            </h1>
            <Card.Text>
              {moment(rsvpProps.eventStartTime).format("MMM DD YYYY • h A")}
              <br />
              {rsvpProps.eventLocation}
              <br />
              {rsvpProps.eventSublocation}
              {!rsvpProps.enableRsvpForm ? <i>Save The Date</i> : <></>}
            </Card.Text>
            <Form onSubmit={submit} hidden={!rsvpProps.enableRsvpForm}>
              <HCaptcha
                id="test"
                size="invisible"
                ref={hcaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                onVerify={onHCaptchaChange}
              />
              <Form.Group className="mb-3">
                <Form.Text>
                  <p>Invites will be sent starting June 2022</p>
                </Form.Text>
                <Form.Control
                  className="text-center"
                  type="text"
                  placeholder="Enter invite code"
                  autoFocus
                  onChange={(e) =>
                    setInviteCode(e.target.value.trim().toUpperCase())
                  }
                  defaultValue={prefilledInviteCode}
                />
                <Form.Text></Form.Text>
              </Form.Group>
              <p style={{ color: "red" }}>
                {error
                  ? "Invalid invite code! Please try again or contact the host for assistance"
                  : ""}
              </p>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="sr-only"></span>
                  </div>
                ) : (
                  "RSVP"
                )}
              </Button>
            </Form>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
  return (
    <div className="rsvp-layout">
      {toast}
      <Row>
        <Col>
          {inviteCard && !inviteCard.notFound ? (
            <InviteCard inviteCard={inviteCard} showFaq={false} />
          ) : (
            retriever
          )}
        </Col>
      </Row>
      <Row>
        <Faq />
      </Row>
    </div>
  );
};

export default Rsvp;
