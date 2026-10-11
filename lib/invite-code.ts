// No 0/O, 1/I/L: codes are read off printed cards and typed by hand.
export const INVITE_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const MIN_INVITE_CODE_LENGTH = 6;
export const DEFAULT_INVITE_CODE_LENGTH = 8;

/** Cryptographically random invite code. Works in both Node and the browser. */
export function generateInviteCode(
  length = DEFAULT_INVITE_CODE_LENGTH,
): string {
  const n = Math.max(
    MIN_INVITE_CODE_LENGTH,
    Math.floor(length) || DEFAULT_INVITE_CODE_LENGTH,
  );
  const alphabet = INVITE_CODE_ALPHABET;
  // Rejection sampling avoids modulo bias.
  const limit = 256 - (256 % alphabet.length);
  let code = "";
  while (code.length < n) {
    const bytes = crypto.getRandomValues(new Uint8Array(n * 2));
    for (const b of bytes) {
      if (b < limit && code.length < n) code += alphabet[b % alphabet.length];
    }
  }
  return code;
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase();
}
