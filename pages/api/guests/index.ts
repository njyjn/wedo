import { Guest } from ".prisma/client";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

// POST /api/guests
export default withApiAuthRequired(async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = getSession(req, res);
  if (req.method == "POST") {
    const { firstName, lastName, phoneNumber, isAttending, salutation } =
      req.body;
    try {
      const guest: Guest = await prisma.guest.create({
        data: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          isAttending: isAttending === true ? true : null,
          salutation: salutation,
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
