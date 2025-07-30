/*
  Warnings:

  - A unique constraint covering the columns `[repository,date]` on the table `PullData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `repository` to the `PullData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PullData" ADD COLUMN     "repository" TEXT NOT NULL,
ALTER COLUMN "starsToday" DROP DEFAULT,
ALTER COLUMN "starsTotal" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "PullData_repository_date_key" ON "PullData"("repository", "date");
