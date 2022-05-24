import { Invite } from ".prisma/client";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

// PATCH /api/settings
export default withApiAuthRequired(function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user } = getSession(req, res);
  if (req.method == "PATCH") {
    const features = req.body;
    try {
      const featureSet = new Map<string, string>(Object.entries(features));
      featureSet.forEach(async (v, k) => {
        try {
          const feature = await prisma.feature.updateMany({
            where: {
              name: k,
            },
            data: {
              value: v,
            },
          });
        } catch {}
      });
    } catch (e) {
      console.error(e);
      res.status(500);
      return res.json({
        ok: false,
        error: e,
      });
    } finally {
      res.status(201);
      return res.json({ ok: true });
    }
  }
});
