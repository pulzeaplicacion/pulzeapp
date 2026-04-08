/*
  Warnings:

  - A unique constraint covering the columns `[userId,number]` on the table `Line` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Line" DROP CONSTRAINT "Line_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "maxLines" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Line_userId_number_key" ON "Line"("userId", "number");

-- AddForeignKey
ALTER TABLE "Line" ADD CONSTRAINT "Line_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
