import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The repository is public and meant to be forked. Event photos, payment QR codes and contact
// details belong in /god/settings (database + Vercel Blob), never in git.

const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

describe("repository hygiene", () => {
  it("only ships neutral assets in public/", () => {
    const allowed = new Set([
      "public/favicon.ico",
      "public/placeholder-cover.svg",
    ]);
    expect(
      tracked.filter((f) => f.startsWith("public/") && !allowed.has(f)),
    ).toEqual([]);
  });

  it("contains no phone numbers", () => {
    const phone = /\+\d{1,3}[\s-]?\d{4}[\s-]?\d{4}\b/;
    const offenders = tracked
      .filter(
        (f) =>
          /\.(tsx?|mjs|md|json|sql|prisma|css)$/.test(f) &&
          f !== "package-lock.json",
      )
      .filter((f) => phone.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
});
