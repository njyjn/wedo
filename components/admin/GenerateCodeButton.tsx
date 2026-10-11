"use client";

import { useState } from "react";
import { generateInviteCode } from "@/lib/invite-code";

export default function GenerateCodeButton({ length }: { length: number }) {
  const [code, setCode] = useState<string | null>(null);
  return (
    <div className="d-flex flex-wrap align-items-center gap-3">
      <button
        type="button"
        className="btn btn-light"
        onClick={() => setCode(generateInviteCode(length))}
      >
        Generate code
      </button>
      {code && <code className="fs-5">{code}</code>}
    </div>
  );
}
