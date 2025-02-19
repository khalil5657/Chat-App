/*
  Warnings:

  - You are about to drop the column `type` on the `MessageFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MessageFile" DROP COLUMN "type";
