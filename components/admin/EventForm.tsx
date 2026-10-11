"use client";

import { saveEvent } from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { useAdminForm } from "@/components/admin/useAdminForm";

export type EventFields = {
  name: string;
  startTime: string;
  location: string;
  sublocation: string;
};

export default function EventForm({
  event,
  timeZone,
}: {
  event: EventFields;
  timeZone: string;
}) {
  const { state, pending, formRef, onSubmit } = useAdminForm(saveEvent, {
    resetOnSuccess: false,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit} className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold mb-1" htmlFor="event-start">
          Date and time
        </label>
        <input
          id="event-start"
          name="startTime"
          type="datetime-local"
          className="form-control"
          defaultValue={event.startTime}
          required
        />
        <div className="form-text">In {timeZone} (the event time zone).</div>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold mb-1" htmlFor="event-name">
          Event name
        </label>
        <input
          id="event-name"
          name="name"
          className="form-control"
          defaultValue={event.name}
          placeholder="Our Wedding"
        />
        <div className="form-text">Shown in the invitation text.</div>
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold mb-1" htmlFor="event-location">
          Venue
        </label>
        <input
          id="event-location"
          name="location"
          className="form-control"
          defaultValue={event.location}
          required
        />
      </div>
      <div className="col-md-6">
        <label
          className="form-label fw-semibold mb-1"
          htmlFor="event-sublocation"
        >
          Room or address line
        </label>
        <input
          id="event-sublocation"
          name="sublocation"
          className="form-control"
          defaultValue={event.sublocation}
        />
      </div>
      <div className="col-12">
        <SubmitButton pending={pending}>Save event</SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
