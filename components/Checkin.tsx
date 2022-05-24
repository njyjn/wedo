import React, { useEffect, useState } from "react";
import { Button, Card, Form, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import CheckinCard, { CheckinCardProps } from "./CheckinCard";
import { Guest } from ".prisma/client";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

const Checkin: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [checkinCard, setCheckinCard] = useState<CheckinCardProps>(null);
  const [error, setError] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    function onScanSuccess(decodedResult) {
      let code;
      try {
        const url = new URL(decodedResult);
        code = url.pathname.replace("/rsvp/", "");
        setError(false);
        setInviteCode(code);
      } catch (e) {
        setError(true);
      }
    }

    function onScanFailure(error) {}

    let html5QrcodeScanner = new Html5QrcodeScanner(
      "qrscanner",
      {
        fps: 10,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    return () => {
      setInviteCode("");
      setError(false);
      html5QrcodeScanner.clear();
    };
  }, []);

  const back = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCheckinCard(null);
    setInviteCode("");
    router.push("/checkin", undefined, { shallow: true });
  };

  const checkin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (inviteCode == "") {
      setSuggestions(null);
      setError(false);
      return;
    }
    setSuggestions(null);
    setError(false);
    setSubmitting(true);
    try {
      const response = await (
        await fetch(`/api/checkin?inviteCode=${inviteCode}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
      ).json();
      if (response["eager"]) {
        setSuggestions(response["guests"]);
      } else {
        setCheckinCard({
          invite: response,
          event: response["event"],
          guests: response["guests"],
        });
        router.push("/checkin", undefined, { shallow: true });
      }
    } catch (error) {
      console.error(error);
      setCheckinCard({
        notFound: true,
      });
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const retriever = (
    <Card
      border="0"
      className="flex align-items-center justify-content-center center text-center"
    >
      <h1 className="signature">Justin & Alethea</h1>
      <h5>Welcome!</h5>
      <Card.Body>
        <Form onSubmit={checkin}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              className="text-center"
              placeholder="Enter invite code or name"
              autoFocus
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              value={inviteCode}
            />
            <Form.Text>
              Please approach the host if you need assistance
            </Form.Text>
          </Form.Group>
          <p>
            {suggestions && suggestions.length > 1 ? (
              suggestions.map((g: Guest) => {
                return (
                  <Button
                    key={g.id}
                    variant="link"
                    onClick={(e) => {
                      setInviteCode(g["invite"]["inviteCode"]);
                    }}
                  >
                    {g.firstName} {g.lastName}
                  </Button>
                );
              })
            ) : (
              <></>
            )}
          </p>
          <Button variant="success" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              "Check In"
            )}
          </Button>
          <p>
            {error ? (
              <span style={{ color: "red" }}>
                No invite or guest found. Please check-in directly with a host
              </span>
            ) : (
              <></>
            )}
          </p>
        </Form>
        Scan QR code
        <div id="qrscanner"></div>
      </Card.Body>
    </Card>
  );
  return (
    <div className="main">
      <Row xs={1} md={1}>
        {checkinCard && !checkinCard.notFound ? (
          <div className="d-grid gap-3">
            <CheckinCard checkinCard={checkinCard} />
            <Button variant="outline-success" onClick={back} mx-auto>
              Done
            </Button>
          </div>
        ) : (
          retriever
        )}
      </Row>
    </div>
  );
};

export default Checkin;
