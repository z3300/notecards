-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('youtube', 'article', 'reddit', 'twitter', 'spotify', 'soundcloud');

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "thumbnail" TEXT,
    "author" TEXT,
    "duration" TEXT,
    "location" TEXT,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);
