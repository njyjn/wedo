import CryptoJS from "crypto-js";
import { Guest } from "@prisma/client";

export const generateInviteCode = (length: number = 6) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
};

export const encryptAES = (text: string, encryptionKey: string) => {
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

export const printFormalName = (guests: Guest[]): string => {
  const inviteRecipient: Guest = guests.find((g) => g.isInviteRecipient);
  const inviteRecipientSalutation: string = inviteRecipient.salutation;
  const isInviteRecipientSalutationFormal = [
    "mr.",
    "mrs.",
    "dr.",
    "ms.",
    "mdm.",
  ].includes(inviteRecipientSalutation?.toLowerCase());

  // Invite recipients sorted first, followed by those with salutations, and then those without
  guests.sort((gA, gB) => {
    if (gA.isInviteRecipient) return -1;
    if (gB.isInviteRecipient) return 1;
    if (gA.salutation) return -1;
    if (gB.salutation) return 1;
    if (gA.firstName === gB.firstName) {
      if (gA.lastName < gB.lastName) return -1;
      if (gA.lastName === gB.lastName) return 0;
      if (gA.lastName > gB.lastName) return 1;
    }
    if (gA.firstName < gB.firstName) return -1;
    if (gA.firstName > gB.firstName) return 1;
  });

  const otherGuestsWithSalutations: Guest[] = guests.filter(
    (g) => !g.isInviteRecipient && g.salutation
  );
  let recipientNames: string[] = [];
  if (isInviteRecipientSalutationFormal) {
    const inviteRecipientFullName: string = [
      inviteRecipient.firstName,
      inviteRecipient.lastName,
    ].join(" ");
    // Only the invite recipient's name is printed
    if (otherGuestsWithSalutations.length === 0) {
      recipientNames.push(
        [inviteRecipientSalutation, inviteRecipientFullName].join(" ")
      );
    } else if (otherGuestsWithSalutations.length === 1) {
      recipientNames.push(
        [
          inviteRecipientSalutation,
          "&",
          otherGuestsWithSalutations[0].salutation,
          inviteRecipientFullName,
        ].join(" ")
      );
    } else {
      // This is weird. If there are three or more, print all their names individually
      recipientNames.push(
        [inviteRecipientSalutation, inviteRecipientFullName].join(" "),
        otherGuestsWithSalutations
          .map((g) => {
            return [g.salutation, g.firstName, g.lastName].join(" ");
          })
          .join(", ")
      );
    }
    // If there are any guests that do not have salutations, they are lumped in together as Family
    if (guests.length - otherGuestsWithSalutations.length > 1) {
      recipientNames.push("Family");
    }
  } else {
    // If invite recipient has salutation, print for all that have it, and if not, first name only
    // e.g. Uncle Boba, Aunty Boba, Boba
    // Otherwise, all guests full names will be printed
    recipientNames = guests.map((g) => {
      return inviteRecipientSalutation
        ? g.salutation
          ? [g.salutation, g.firstName].join(" ")
          : g.firstName
        : [g.firstName, g.lastName].join(" ");
    });
  }

  return recipientNames.length === 2
    ? recipientNames.join(" & ")
    : recipientNames.join(", ");
};
