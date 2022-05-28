import { Event, Feature, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const event: Event = await prisma.event.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Test Event",
      startTime: "2022-08-20T10:30:00.000Z",
      endTime: "2022-08-20T14:00:00.000Z",
      doorsOpenTime: "2022-08-20T10:20:00.000Z",
      seatedByTime: "2022-08-20T10:20:00.000Z",
      location: "Someplace CA",
    },
  });
  const defaultEventId: Feature = await prisma.feature.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "defaultEventId",
      value: "1",
    },
  });
  const prismaClientUrl: Feature = await prisma.feature.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "prismaClientUrl",
      value: "https://cloud.prisma.io/njyjn/wedo/production/databrowser",
    },
  });
  const defaultInviteCodeLength: Feature = await prisma.feature.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "defaultInviteCodeLength",
      value: "4",
    },
  });
  const groomName: Feature = await prisma.feature.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: "groomName",
      value: "Justin Ng",
    },
  });
  const brideName: Feature = await prisma.feature.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: "brideName",
      value: "Alethea Sim",
    },
  });
  const coupleName: Feature = await prisma.feature.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: "coupleName",
      value: "Justin & Alethea",
    },
  });
  const footerText: Feature = await prisma.feature.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: "footerText",
      value: "Made with ❤️ in 🇸🇬 by Aletheon Corp",
    },
  });
  const slackBotToken: Feature = await prisma.feature.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name: "slackBotToken",
      value: "",
    },
  });
  const slackNotificationChannel: Feature = await prisma.feature.upsert({
    where: { id: 9 },
    update: {},
    create: {
      name: "slackNotificationChannel",
      value: "",
    },
  });
  const enableRsvpForm: Feature = await prisma.feature.upsert({
    where: { id: 10 },
    update: {},
    create: {
      name: "enableRsvpForm",
      value: "1",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
