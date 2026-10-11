"use client";

import { useState } from "react";
import { generateInviteCode } from "@/lib/invite-code";

export default function GenerateCodeButton({ length }: { length: number }) {
  const [code, setCode] = useState<string | null>(null);
  return (
    <button
      type="button"
      className="btn btn-light"
      onClick={() => setCode(generateInviteCode(length))}
    >
      🏷 Generate Invite Code{code && <code className="ms-2">{code}</code>}
    </button>
  );
}
