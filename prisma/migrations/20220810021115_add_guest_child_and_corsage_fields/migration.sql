-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "isChild" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCorsageRecipient" BOOLEAN NOT NULL DEFAULT false;
