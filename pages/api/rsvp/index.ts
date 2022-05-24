import { Guest } from ".prisma/client";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { verifyHCaptcha } from "../../../lib/hcaptcha";
import {
  sendNotAttendingNotification,
  sendRsvpNotification,
} from "../../../lib/rsvp";

// POST /api/rsvp
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    try {
      const { inviteCode, captcha } = req.body;
      if (!inviteCode || !captcha) {
        const error = "Invalid invite id or captcha verification";
        console.error(error);
        return res
          .status(400)
          .json({ error: "Invalid invite code or captcha verification" });
      }
      if (!verifyHCaptcha(captcha)) {
        return res.status(422).json({ error: "Invalid captcha" });
      }
      let invite = await prisma.invite.findFirst({
        where: { inviteCode: inviteCode },
        include: {
          event: true,
          guests: true,
        },
      });
      if (!invite) {
        return res.status(404).json({ error: "Invite not found" });
      }
      return res.json(invite);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  } else if (req.method == "PATCH") {
    try {
      const {
        id,
        attendingGuests,
        recipientNotes,
        dietaryRequirements,
        attending,
        captcha,
      } = req.body;
      if (!id || !captcha) {
        const error = "Invalid invite id or captcha verification";
        console.error(error);
        return res.status(400).json({ error: error });
      }
      if (!verifyHCaptcha(captcha)) {
        const error = "Invalid captcha";
        console.error(error);
        return res.status(422).json({ error: error });
      }
      const invite = await prisma.invite.update({
        where: {
          id: id,
        },
        data: {
          attending: attending,
          respondedAt: moment().toDate(),
          recipientNotes: recipientNotes,
        },
      });
      // dietaryRequirements have to be mapped manually, for now
      attendingGuests.forEach(async (g: Guest) => {
        if (g.isAttending != null) {
          await prisma.guest.update({
            where: {
              id: g.id,
            },
            data: {
              isAttending: g.isAttending,
            },
          });
        }
      });
      try {
        if (attending) {
          await sendRsvpNotification(
            invite.inviteCode,
            attendingGuests,
            recipientNotes
          );
        } else {
          await sendNotAttendingNotification(invite.inviteCode, recipientNotes);
        }
      } catch (error) {
        console.error(error);
      }
      return res.status(201).json({ ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error });
    }
  }
}
