import { describe, expect, it } from "vitest";
import {
  generateInviteCode,
  INVITE_CODE_ALPHABET,
  MIN_INVITE_CODE_LENGTH,
  normalizeInviteCode,
} from "@/lib/invite-code";

describe("generateInviteCode", () => {
  it("defaults to 8 characters from the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(8);
      for (const ch of code) expect(INVITE_CODE_ALPHABET).toContain(ch);
    }
  });

  it("never generates codes shorter than the minimum", () => {
    expect(generateInviteCode(4)).toHaveLength(MIN_INVITE_CODE_LENGTH);
    expect(generateInviteCode(Number.NaN)).toHaveLength(8);
    expect(generateInviteCode(12)).toHaveLength(12);
  });

  it("does not repeat in practice", () => {
    const codes = new Set(
      Array.from({ length: 5000 }, () => generateInviteCode()),
    );
    expect(codes.size).toBe(5000);
  });

  it("normalizes user input", () => {
    expect(normalizeInviteCode("  ab12cd ")).toBe("AB12CD");
  });
});
