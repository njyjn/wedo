"use client";

import { removeSettingImage, uploadSettingImage } from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { useAdminForm } from "@/components/admin/useAdminForm";

export type ImageField = {
  key: string;
  label: string;
  help?: string;
  urls: string[];
};

function RemoveButton({
  settingKey,
  url,
}: {
  settingKey: string;
  url: string;
}) {
  const { state, pending, formRef, onSubmit } =
    useAdminForm(removeSettingImage);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="d-inline">
      <input type="hidden" name="key" value={settingKey} />
      <input type="hidden" name="url" value={url} />
      <button
        className="btn btn-sm btn-outline-danger"
        type="submit"
        disabled={pending}
      >
        Remove
      </button>
      {state.ok === false && (
        <span className="small text-danger ms-2">{state.message}</span>
      )}
    </form>
  );
}

function ImageSetting({ field }: { field: ImageField }) {
  const { state, pending, formRef, onSubmit } =
    useAdminForm(uploadSettingImage);
  return (
    <div className="mb-4">
      <div className="fw-semibold">{field.label}</div>
      {field.help && <div className="small text-muted mb-2">{field.help}</div>}
      <div className="d-flex flex-wrap gap-3 mb-2">
        {field.urls.map((url) => (
          <div key={url} className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- previews of arbitrary hosts */}
            <img
              src={url}
              alt=""
              style={{ height: 120, width: "auto", display: "block" }}
              className="mb-1 border"
            />
            <RemoveButton settingKey={field.key} url={url} />
          </div>
        ))}
        {field.urls.length === 0 && (
          <span className="small text-muted">None set.</span>
        )}
      </div>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="row g-2 align-items-center"
      >
        <input type="hidden" name="key" value={field.key} />
        <div className="col-auto">
          <input
            className="form-control form-control-sm"
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            aria-label={`Upload ${field.label}`}
            required
          />
        </div>
        <div className="col-auto">
          <SubmitButton pending={pending}>Upload</SubmitButton>
        </div>
        <ActionMessage state={state} />
      </form>
    </div>
  );
}

export default function ImageSettings({ fields }: { fields: ImageField[] }) {
  return (
    <>
      {fields.map((f) => (
        <ImageSetting key={f.key} field={f} />
      ))}
    </>
  );
}
