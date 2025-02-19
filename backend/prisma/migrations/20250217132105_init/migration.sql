-- CreateTable
CREATE TABLE "LastSeenMessages" (
    "id" TEXT NOT NULL,
    "byid" TEXT NOT NULL,
    "withid" TEXT NOT NULL,
    "lastseenmessageid" TEXT,

    CONSTRAINT "LastSeenMessages_pkey" PRIMARY KEY ("id")
);
