// Seeds a demo event, settings, one table and one invite (code DEMO2026). Safe to re-run.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { parseDatabaseUrl } from "../lib/db-url";

const { connectionString, schema } = parseDatabaseUrl(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }, { schema }),
});

const settings: Record<string, string> = {
  defaultEventId: "1",
  defaultInviteCodeLength: "8",
  coupleName: "Justin & Alethea",
  groomName: "Justin Ng",
  brideName: "Alethea Sim",
  footerText: "Made with ❤️ in 🇸🇬 by Aletheon Corp",
  enableRsvpForm: "1",
  timeZone: "Asia/Singapore",
  slackNotificationChannel: "",
};

async function main() {
  const nextYear = new Date().getUTCFullYear() + 1;
  const event = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Our Wedding",
      startTime: new Date(`${nextYear}-08-20T10:30:00.000Z`),
      endTime: new Date(`${nextYear}-08-20T14:00:00.000Z`),
      doorsOpenTime: new Date(`${nextYear}-08-20T10:00:00.000Z`),
      seatedByTime: new Date(`${nextYear}-08-20T10:15:00.000Z`),
      location: "PARKROYAL COLLECTION Pickering",
      sublocation: "William Pickering Ballroom, Level 2",
    },
  });

  for (const [name, value] of Object.entries(settings)) {
    const existing = await prisma.feature.findFirst({ where: { name } });
    if (!existing) await prisma.feature.create({ data: { name, value } });
  }

  const table = await prisma.table.upsert({
    where: { id: 1 },
    update: {},
    create: { maxPax: 10, name: "1" },
  });

  if (
    !(await prisma.invite.findUnique({ where: { inviteCode: "DEMO2026" } }))
  ) {
    await prisma.invite.create({
      data: {
        eventId: event.id,
        inviteCode: "DEMO2026",
        issuedAt: new Date(),
        respondBy: new Date(`${nextYear}-07-01`),
        guests: {
          create: [
            {
              firstName: "John",
              lastName: "Tan",
              salutation: "Mr.",
              isInviteRecipient: true,
              tableId: table.id,
            },
            {
              firstName: "Mary",
              lastName: "Tan",
              salutation: "Mrs.",
              tableId: table.id,
            },
            {
              firstName: "Bobby",
              lastName: "Tan",
              isChild: true,
              tableId: table.id,
            },
          ],
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
