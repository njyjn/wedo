-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isInviteRecipient" BOOLEAN NOT NULL DEFAULT false,
    "vaccinated" BOOLEAN,
    "negativePET" BOOLEAN,
    "tableId" INTEGER,
    "dietaryRequirements" TEXT,
    "inviteId" INTEGER,
    "isAttending" BOOLEAN,
    "salutation" TEXT,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "eventId" INTEGER NOT NULL,
    "attending" BOOLEAN,
    "respondedAt" TIMESTAMP(3),
    "recipientNotes" TEXT,
    "customText" TEXT,
    "issuedAt" TIMESTAMP(3),
    "inviteCode" TEXT,
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT E'live',
    "relationship" TEXT,
    "respondBy" TIMESTAMP(3),

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "doorsOpenTime" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "seatedByTime" TIMESTAMP(3),
    "sublocation" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "maxPax" INTEGER,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_inviteCode_key" ON "Invite"("inviteCode");

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "Invite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
