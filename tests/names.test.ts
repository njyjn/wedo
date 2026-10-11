import { describe, expect, it } from "vitest";
import { printFormalName, type NamedGuest } from "@/lib/names";

const g = (
  firstName: string,
  lastName: string,
  salutation: string | null = null,
  isInviteRecipient = false,
): NamedGuest => ({
  firstName,
  lastName,
  salutation,
  isInviteRecipient,
});

describe("printFormalName", () => {
  it("addresses a formal recipient alone", () => {
    expect(printFormalName([g("John", "Tan", "Mr.", true)])).toBe(
      "Mr. John Tan",
    );
  });

  it("combines a formal couple and adds Family for the rest", () => {
    expect(
      printFormalName([
        g("Bobby", "Tan"),
        g("Mary", "Tan", "Mrs."),
        g("John", "Tan", "Mr.", true),
      ]),
    ).toBe("Mr. & Mrs. John Tan & Family");
  });

  it("lists everyone individually when three or more have salutations", () => {
    expect(
      printFormalName([
        g("John", "Tan", "Dr.", true),
        g("Mary", "Tan", "Mrs."),
        g("Ann", "Lim", "Ms."),
      ]),
    ).toBe("Dr. John Tan & Ms. Ann Lim, Mrs. Mary Tan");
  });

  it("uses informal salutations with first names", () => {
    expect(
      printFormalName([
        g("Boba", "Lee", "Uncle", true),
        g("Boba", "Lee", "Aunty"),
        g("Boba", "Lee"),
      ]),
    ).toBe("Uncle Boba, Aunty Boba, Boba");
  });

  it("uses full names without salutations", () => {
    expect(
      printFormalName([g("Ann", "Lim", null, true), g("Ben", "Ong")]),
    ).toBe("Ann Lim & Ben Ong");
  });

  it("does not crash without an invite recipient, and does not mutate its input", () => {
    const guests = [g("Zed", "Ong"), g("Ann", "Lim")];
    expect(printFormalName(guests)).toBe("Ann Lim & Zed Ong");
    expect(guests[0].firstName).toBe("Zed");
    expect(printFormalName([])).toBe("");
  });
});
