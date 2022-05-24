import { Guest } from ".prisma/client";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

// PATCH /api/guests/[guestId]
export default withApiAuthRequired(async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = getSession(req, res);
  if (req.method == "PATCH") {
    const { guestId } = req.query;
    const { firstName, lastName, phoneNumber, isAttending, tableId, inviteId } =
      req.body;
    try {
      const guest: Guest = await prisma.guest.update({
        where: {
          id: parseInt(guestId.toString()),
        },
        data: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          isAttending: isAttending,
          tableId: tableId,
          inviteId: inviteId,
        },
      });
      if (!guest) {
        res.status(400);
      }
      return res.json(guest);
    } catch (e) {
      console.error(e);
      res.status(500);
      return res.json({ error: e });
    }
  }
});
