// import { getSession } from 'next-auth/client';
import { Guest } from ".prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";

// GET /api/checkin
export default withApiAuthRequired(async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    const inviteCode = req.query["inviteCode"].toString();
    if (!inviteCode) {
      return res.status(400).json({});
    }
    let invite = await prisma.invite.findFirst({
      where: { inviteCode: inviteCode },
      include: {
        event: true,
        guests: true,
      },
    });
    if (!invite) {
      let guests: Guest[];
      // try searching by first name or last name
      guests = await prisma.guest.findMany({
        where: {
          inviteId: {
            not: null,
          },
          OR: [
            {
              firstName: {
                startsWith: inviteCode,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                startsWith: inviteCode,
                mode: "insensitive",
              },
            },
            {
              firstName: {
                in: inviteCode.split(" "),
                mode: "insensitive",
              },
            },
            {
              lastName: {
                in: inviteCode.split(" "),
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: [
          {
            firstName: "asc",
          },
        ],
        include: {
          invite: true,
        },
      });
      if (guests.length == 1) {
        invite = await prisma.invite.findFirst({
          where: {
            id: guests[0]?.inviteId || 0,
          },
          include: {
            event: true,
            guests: true,
          },
        });
      } else if (guests.length > 1) {
        return res.json({
          eager: true,
          guests: guests,
        });
      } else {
        res.status(404);
      }
    } else {
      res.status(404);
    }
    return res.json(invite);
  } else {
    return res.status(400).json({});
  }
});
