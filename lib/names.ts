export type NamedGuest = {
  firstName: string;
  lastName: string;
  salutation: string | null;
  isInviteRecipient: boolean;
};

const FORMAL_SALUTATIONS = ["mr.", "mrs.", "dr.", "ms.", "mdm."];

function compareGuests(a: NamedGuest, b: NamedGuest): number {
  if (a.isInviteRecipient !== b.isInviteRecipient)
    return a.isInviteRecipient ? -1 : 1;
  if (!!a.salutation !== !!b.salutation) return a.salutation ? -1 : 1;
  return (
    a.firstName.localeCompare(b.firstName) ||
    a.lastName.localeCompare(b.lastName)
  );
}

/**
 * Formal addressee line for an invite, e.g. "Mr. & Mrs. John Tan, Family" or "Uncle Boba & Boba".
 * Invite recipients sort first, then guests with salutations, then everyone else by name.
 */
export function printFormalName(input: NamedGuest[]): string {
  if (input.length === 0) return "";
  const guests = [...input].sort(compareGuests);
  const recipient = guests.find((g) => g.isInviteRecipient) ?? guests[0];
  const recipientSalutation = recipient.salutation;
  const isFormal = FORMAL_SALUTATIONS.includes(
    recipientSalutation?.toLowerCase() ?? "",
  );

  let names: string[];
  if (isFormal) {
    const othersWithSalutation = guests.filter(
      (g) => g !== recipient && g.salutation,
    );
    const recipientFullName = `${recipient.firstName} ${recipient.lastName}`;
    names = [];
    if (othersWithSalutation.length === 0) {
      names.push(`${recipientSalutation} ${recipientFullName}`);
    } else if (othersWithSalutation.length === 1) {
      names.push(
        `${recipientSalutation} & ${othersWithSalutation[0].salutation} ${recipientFullName}`,
      );
    } else {
      // Three or more people with salutations: print them individually.
      names.push(
        `${recipientSalutation} ${recipientFullName}`,
        othersWithSalutation
          .map((g) => `${g.salutation} ${g.firstName} ${g.lastName}`)
          .join(", "),
      );
    }
    // Anyone without a salutation is addressed collectively.
    if (guests.length - othersWithSalutation.length > 1) names.push("Family");
  } else {
    // e.g. "Uncle Boba, Aunty Boba, Boba" when the recipient has an informal salutation,
    // otherwise everyone's full name.
    names = guests.map((g) =>
      recipientSalutation
        ? g.salutation
          ? `${g.salutation} ${g.firstName}`
          : g.firstName
        : `${g.firstName} ${g.lastName}`,
    );
  }
  return names.length === 2 ? names.join(" & ") : names.join(", ");
}
