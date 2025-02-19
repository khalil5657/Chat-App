/*
  Warnings:

  - Added the required column `fromid` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toid` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "fromid" TEXT NOT NULL,
ADD COLUMN     "sentdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "toid" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageFile" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "messageid" TEXT NOT NULL,

    CONSTRAINT "MessageFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userid_key" ON "UserImage"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFile_messageid_key" ON "MessageFile"("messageid");

-- AddForeignKey
ALTER TABLE "UserImage" ADD CONSTRAINT "UserImage_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromid_fkey" FOREIGN KEY ("fromid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toid_fkey" FOREIGN KEY ("toid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageFile" ADD CONSTRAINT "MessageFile_messageid_fkey" FOREIGN KEY ("messageid") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
