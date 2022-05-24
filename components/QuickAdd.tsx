import { Feature, Guest, Invite, Table as GuestTable } from ".prisma/client";
import { useState } from "react";
import { Button, Col, Form, FormGroup, InputGroup, Row } from "react-bootstrap";
import { getFeature } from "../lib/feature";
import { generateInviteCode } from "../lib/utils";

export type QuickAddProps = {
  invites?: Invite[];
  tables?: GuestTable[];
  guests?: Guest[];
  features?: Feature[];
};

export const QuickGenerateInvite: React.FC<{ quickAdd: QuickAddProps }> = ({
  quickAdd,
}) => {
  const guests = quickAdd.guests
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const [primaryContactGuestId, setPrimaryContactGuestId] = useState(0);
  const [inviteCode, setInviteCode] = useState(generateInviteCode(4));
  const [respondBy, setRespondBy] = useState(null);
  const [type, setType] = useState("live");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (primaryContactGuestId == 0) {
      alert("Select a primary contact to assign");
      return;
    }
    setIsLoading(true);
    const body = {
      inviteCode,
      type,
      primaryContactGuestId,
      eventId: getFeature("defaultEventId", quickAdd.features),
      respondBy: respondBy,
    };
    try {
      const response = await (
        await fetch(`/api/invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).json();
      if (response.error) {
        throw Error(JSON.stringify(response.error));
      }
    } catch (error) {
      alert(`Something went wrong. ${error}`);
      console.error(error);
    }
    window.location.reload();
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputCic" visuallyHidden>
            Custom Invite Code
          </Form.Label>
          <InputGroup className="mb-2">
            <Form.Select onChange={(e) => setType(e.target.value)}>
              <option value="live">Live</option>
              <option value="zoom">Zoom</option>
            </Form.Select>
            <Form.Control
              required
              id="inlineFormInputCic"
              defaultValue={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputPc" visuallyHidden>
            Primary Contact
          </Form.Label>
          <Form.Select
            className="mb-2"
            onChange={(e) => setPrimaryContactGuestId(parseInt(e.target.value))}
          >
            <option value={0}>Select primary contact...</option>
            {guests.map((g) => {
              const invite: Invite = g["invite"];
              return (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName} ({invite?.inviteCode})
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputRb" visuallyHidden>
            Respond by
          </Form.Label>
          <Form.Control
            className="mb-2"
            id="inlineFormInputRb"
            type="date"
            defaultValue={"2022-08-20"}
            onChange={(e) => setRespondBy(e.target.value)}
          ></Form.Control>
        </Col>
        <Col xs="auto">
          <Button disabled={isLoading} type="submit" className="mb-2">
            {isLoading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              "Quick Generate Invite"
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export const QuickAssignTableInvite: React.FC<{ quickAdd: QuickAddProps }> = ({
  quickAdd,
}) => {
  const guests = quickAdd.guests
    .slice()
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
  const tables = quickAdd.tables.slice().sort((a, b) => a.id - b.id);
  const invites = quickAdd.invites;
  const [guestId, setGuestId] = useState(0);
  const [tableId, setTableId] = useState(null);
  const [inviteId, setInviteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!guests || !tables) return;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (guestId == 0) {
      alert("Select a guest to assign");
      return;
    }
    if (!tableId && !inviteId) {
      alert("Select either a table or invite to assign");
      return;
    }
    setIsLoading(true);
    const body = {};
    if (tableId) {
      body["tableId"] = tableId > 0 ? parseInt(tableId) : null;
    }
    if (inviteId) {
      body["inviteId"] = inviteId > 0 ? parseInt(inviteId) : null;
    }
    try {
      const response = await (
        await fetch(`/api/guests/${guestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).json();
      if (response.error) {
        throw Error(JSON.stringify(response.error));
      }
    } catch (error) {
      alert(`Something went wrong. ${error}`);
      console.error(error);
    }
    window.location.reload();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputFn" visuallyHidden>
            Guest
          </Form.Label>
          <Form.Select
            required
            onChange={(e) => setGuestId(parseInt(e.target.value))}
            className="mb-2"
          >
            <option value={0}>Select guest...</option>
            {guests.map((g) => {
              return (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputTb" visuallyHidden>
            Table
          </Form.Label>
          <Form.Select
            onChange={(e) => setTableId(e.target.value)}
            className="mb-2"
          >
            <option value={null}>Select table...</option>
            <option value={-1}>unassign</option>
            {tables.map((t) => {
              return (
                <option key={t.id} value={t.id}>
                  {t.id} ({t["guests"]?.length || 0}/{t.maxPax})
                  {t.isVip ? " - VIP" : ""}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputIn" visuallyHidden>
            Invite
          </Form.Label>
          <Form.Select
            onChange={(e) => setInviteId(e.target.value)}
            className="mb-2"
          >
            <option value={null}>Select invite...</option>
            <option value={-1}>unassign</option>
            {invites.map((i) => {
              var recipientName = "Unassigned";
              if (i["guests"]) {
                var recipient: Guest = i["guests"].find((g: Guest) => {
                  return g.isInviteRecipient;
                });
                recipientName = recipient.firstName + " " + recipient.lastName;
              }
              return (
                <option key={i.id} value={i.id}>
                  {i.inviteCode} ({recipientName})
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Button
            disabled={isLoading}
            type="submit"
            className="mb-2"
            id="inlineFormInputButton"
          >
            {isLoading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              "Quick Assign"
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export const QuickAddGuest: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [isAttending, setIsAttending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [salutation, setSalutation] = useState(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const body = {
        firstName,
        lastName,
        phoneNumber,
        isAttending,
        salutation,
      };
      // alert(JSON.stringify(body))
      const response = await (
        await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      ).json();
      if (response.error) {
        throw Error(JSON.stringify(response.error));
      }
    } catch (error) {
      alert(`Something went wrong. ${error}`);
      console.error(error);
    }
    window.location.reload();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-center">
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputFn" visuallyHidden>
            First Name
          </Form.Label>
          <Form.Control
            required
            className="mb-2"
            id="inlineFormInputFn"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputLn" visuallyHidden>
            Last Name
          </Form.Label>
          <Form.Control
            required
            className="mb-2"
            id="inlineFormInputLn"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputGroupPh" visuallyHidden>
            Ph
          </Form.Label>
          <InputGroup hasValidation className="mb-2">
            <InputGroup.Text>+65</InputGroup.Text>
            <Form.Control
              id="inlineFormInputGroupPh"
              placeholder="Phone Number"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Form.Label htmlFor="inlineFormInputGroupSl" visuallyHidden>
            Salutation
          </Form.Label>
          <InputGroup hasValidation className="mb-2">
            <Form.Control
              id="inlineFormInputGroupSl"
              placeholder="Salutation"
              onChange={(e) => setSalutation(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs="auto">
          <Form.Check
            type="checkbox"
            id="autoSizingCheckAttending"
            className="mb-2"
            label="Attending"
            onClick={() => setIsAttending(!isAttending)}
          />
        </Col>
        <Col xs="auto">
          <Button disabled={isLoading} type="submit" className="mb-2">
            {isLoading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="sr-only"></span>
              </div>
            ) : (
              "Quick Add Guest"
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
