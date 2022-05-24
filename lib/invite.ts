import prisma from "../lib/prisma";
import { generateInviteCode } from "./utils";
import CryptoJS from "crypto-js";

const finalizeInvite = async (id: number) => {
  const inviteCode = generateInviteCode();
  await prisma.invite.update({
    where: {
      id: id,
    },
    data: {
      inviteCode: inviteCode,
    },
  });
};

const validateInvite = async (inviteCode: string) => {
  const invite = await prisma.invite.findFirst({
    where: {
      inviteCode: inviteCode,
    },
  });
  if (!invite) {
    throw new Error();
  }
  return invite;
};

export { generateInviteCode, finalizeInvite, validateInvite };
