"use client";

import { useRef, useState } from "react";
import {
  removeSettingImage,
  uploadSettingImage,
  type ActionState,
} from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { resizeForUpload } from "@/components/admin/resizeImage";
import { useAdminForm } from "@/components/admin/useAdminForm";

export type ImageField = {
  key: string;
  label: string;
  help?: string;
  urls: string[];
  /** Photo lists accept several files at once. */
  multiple: boolean;
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
  const [state, setState] = useState<ActionState>({});
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload one file at a time: each upload appends to the stored list, so parallel requests could
  // overwrite each other.
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = [...(inputRef.current?.files ?? [])];
    if (files.length === 0) return;
    setPending(true);
    let done = 0;
    try {
      for (const original of files) {
        setState({
          message:
            files.length > 1
              ? `Uploading ${done + 1} of ${files.length}...`
              : "Uploading...",
        });
        const formData = new FormData();
        formData.set("key", field.key);
        formData.set("file", await resizeForUpload(original));
        const result = await uploadSettingImage({}, formData);
        if (!result.ok) {
          setState({
            ok: false,
            message:
              done > 0
                ? `${result.message} (${done} of ${files.length} uploaded.)`
                : result.message,
          });
          return;
        }
        done++;
      }
      setState({
        ok: true,
        message: done > 1 ? `Uploaded ${done} photos.` : "Uploaded.",
      });
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setState({
        ok: false,
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    } finally {
      setPending(false);
    }
  };

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
      <form onSubmit={onSubmit} className="row g-2 align-items-center">
        <div className="col-auto">
          <input
            ref={inputRef}
            className="form-control form-control-sm"
            type="file"
            name="file"
            multiple={field.multiple}
            accept="image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif"
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
