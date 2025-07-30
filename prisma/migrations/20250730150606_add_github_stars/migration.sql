/*
  Warnings:

  - You are about to drop the column `starsToday` on the `PullData` table. All the data in the column will be lost.
  - You are about to drop the column `starsTotal` on the `PullData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PullData" DROP COLUMN "starsToday",
DROP COLUMN "starsTotal";

-- CreateTable
CREATE TABLE "GitHubStarsData" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starsToday" INTEGER NOT NULL,
    "starsTotal" INTEGER NOT NULL,

    CONSTRAINT "GitHubStarsData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubStarsData_date_key" ON "GitHubStarsData"("date");
