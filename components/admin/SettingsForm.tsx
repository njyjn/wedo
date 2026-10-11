"use client";

import { saveSettings } from "@/app/god/actions";
import ActionMessage from "@/components/admin/ActionMessage";
import SubmitButton from "@/components/admin/SubmitButton";
import { useAdminForm } from "@/components/admin/useAdminForm";

type Field = { key: string; label: string; value: string; multiline: boolean };

export default function SettingsForm({ fields }: { fields: Field[] }) {
  const { state, pending, formRef, onSubmit } = useAdminForm(saveSettings, {
    resetOnSuccess: false,
  });
  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.key}>
                <td>
                  <label htmlFor={`setting-${f.key}`}>{f.label}</label>
                  <div className="small text-muted">
                    <code>{f.key}</code>
                  </div>
                </td>
                <td>
                  {f.multiline ? (
                    <textarea
                      id={`setting-${f.key}`}
                      name={f.key}
                      className="form-control"
                      rows={3}
                      defaultValue={f.value}
                    />
                  ) : (
                    <input
                      id={`setting-${f.key}`}
                      name={f.key}
                      className="form-control"
                      defaultValue={f.value}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SubmitButton pending={pending}>Save</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}
