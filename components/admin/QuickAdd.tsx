"use client";

import { useState } from "react";
import { addGuest, assignGuest, createInvite } from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { generateInviteCode } from "@/lib/invite-code";

export type GuestOption = {
  id: number;
  name: string;
  inviteCode: string | null;
};
export type TableOption = { id: number; label: string };
export type InviteOption = { id: number; label: string };

export function QuickAddGuest() {
  const { state, pending, formRef, onSubmit } = useAdminForm(addGuest);
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="row g-2 align-items-center mb-2"
    >
      <div className="col-auto">
        <input
          required
          name="firstName"
          className="form-control"
          placeholder="First Name"
          aria-label="First name"
        />
      </div>
      <div className="col-auto">
        <input
          required
          name="lastName"
          className="form-control"
          placeholder="Last Name"
          aria-label="Last name"
        />
      </div>
      <div className="col-auto">
        <div className="input-group">
          <span className="input-group-text">+65</span>
          <input
            name="phoneNumber"
            className="form-control"
            placeholder="Phone Number"
            aria-label="Phone number"
          />
        </div>
      </div>
      <div className="col-auto">
        <input
          name="salutation"
          className="form-control"
          placeholder="Salutation"
          aria-label="Salutation"
        />
      </div>
      <div className="col-auto form-check ms-2">
        <input
          className="form-check-input"
          type="checkbox"
          name="isAttending"
          id="quick-add-attending"
        />
        <label className="form-check-label" htmlFor="quick-add-attending">
          Attending
        </label>
      </div>
      <div className="col-auto">
        <SubmitButton pending={pending}>Quick Add Guest</SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

export function QuickAssignTableInvite({
  guests,
  tables,
  invites,
}: {
  guests: GuestOption[];
  tables: TableOption[];
  invites: InviteOption[];
}) {
  const { state, pending, formRef, onSubmit } = useAdminForm(assignGuest);
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="row g-2 align-items-center mb-2"
    >
      <div className="col-auto">
        <select
          required
          name="guestId"
          className="form-select"
          aria-label="Guest"
          defaultValue=""
        >
          <option value="" disabled>
            Select guest...
          </option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-auto">
        <select
          name="tableId"
          className="form-select"
          aria-label="Table"
          defaultValue=""
        >
          <option value="">Select table...</option>
          <option value="-1">unassign</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-auto">
        <select
          name="inviteId"
          className="form-select"
          aria-label="Invite"
          defaultValue=""
        >
          <option value="">Select invite...</option>
          <option value="-1">unassign</option>
          {invites.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-auto">
        <SubmitButton pending={pending}>Quick Assign</SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

export function QuickGenerateInvite({
  guests,
  codeLength,
}: {
  guests: GuestOption[];
  codeLength: number;
}) {
  const [suggestedCode, setSuggestedCode] = useState("");
  const { state, pending, formRef, onSubmit } = useAdminForm(
    async (prev, formData) => {
      const result = await createInvite(prev, formData);
      if (result.ok) setSuggestedCode("");
      return result;
    },
  );
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="row g-2 align-items-center mb-2"
    >
      <div className="col-auto">
        <div className="input-group">
          <select
            name="type"
            className="form-select"
            aria-label="Invite type"
            defaultValue="live"
          >
            <option value="live">Live</option>
            <option value="zoom">Zoom</option>
          </select>
          <input
            name="inviteCode"
            className="form-control text-uppercase"
            aria-label="Invite code"
            placeholder="Code (blank = random)"
            value={suggestedCode}
            onChange={(e) => setSuggestedCode(e.target.value.toUpperCase())}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            title="Generate a random code"
            onClick={() => setSuggestedCode(generateInviteCode(codeLength))}
          >
            🎲
          </button>
        </div>
      </div>
      <div className="col-auto">
        <select
          name="primaryContactGuestId"
          className="form-select"
          aria-label="Primary contact"
          defaultValue=""
        >
          <option value="">Select primary contact...</option>
          {guests.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.inviteCode ?? "no invite"})
            </option>
          ))}
        </select>
      </div>
      <div className="col-auto">
        <input
          name="respondBy"
          type="date"
          className="form-control"
          aria-label="Respond by"
        />
      </div>
      <div className="col-auto">
        <SubmitButton pending={pending}>Quick Generate Invite</SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
