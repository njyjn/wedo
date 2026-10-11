"use client";

import { saveSettings } from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { useAdminForm } from "@/components/admin/useAdminForm";

export type SettingField = {
  key: string;
  label: string;
  value: string;
  kind: "text" | "markdown" | "image" | "images";
  help?: string;
};

export default function SettingsForm({ fields }: { fields: SettingField[] }) {
  const { state, pending, formRef, onSubmit } = useAdminForm(saveSettings, {
    resetOnSuccess: false,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit}>
      {fields.map((f) => {
        const id = `setting-${f.key}`;
        const rows = f.kind === "markdown" ? (f.key === "faq" ? 14 : 4) : 3;
        return (
          <div className="mb-3" key={f.key}>
            <label className="form-label fw-semibold mb-0" htmlFor={id}>
              {f.label}
            </label>
            <div className="small text-muted mb-1">
              <code>{f.key}</code>
              {f.kind === "markdown" && " · Markdown"}
              {f.help && ` · ${f.help}`}
            </div>
            {f.kind === "markdown" || f.kind === "images" ? (
              <textarea
                id={id}
                name={f.key}
                className={`form-control${f.kind === "markdown" ? " font-monospace" : ""}`}
                rows={rows}
                defaultValue={f.value}
              />
            ) : (
              <input
                id={id}
                name={f.key}
                className="form-control"
                defaultValue={f.value}
              />
            )}
          </div>
        );
      })}
      <SubmitButton pending={pending}>Save</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}
