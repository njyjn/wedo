import { Invite } from ".prisma/client";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

// POST /api/invites
export default withApiAuthRequired(async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = getSession(req, res);
  if (req.method == "POST") {
    const { eventId, inviteCode, primaryContactGuestId, type, respondBy } =
      req.body;
    try {
      const invite: Invite = await prisma.invite.create({
        data: {
          eventId: parseInt(eventId),
          inviteCode: inviteCode,
          issuedAt: moment().toDate(),
          type: type,
          guests: {
            connect: {
              id: parseInt(primaryContactGuestId),
            },
          },
          respondBy: moment(respondBy).toDate(),
        },
      });
      await prisma.guest.update({
        where: {
          id: primaryContactGuestId,
        },
        data: {
          isInviteRecipient: true,
        },
      });
      if (!invite) {
        res.status(400);
      }
      return res.json(invite);
    } catch (e) {
      console.error(e);
      res.status(500);
      return res.json({ error: e });
    }
  }
});
