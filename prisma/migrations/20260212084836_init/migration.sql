/*
  Warnings:

  - A unique constraint covering the columns `[mobileNumber]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobileNumber]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mobileNumber` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNumber` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problem` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "mobileNumber" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'General';

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "mobileNumber" TEXT NOT NULL,
ADD COLUMN     "problem" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" ADD COLUMN     "exersice" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "doctors_mobileNumber_key" ON "doctors"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mobileNumber_key" ON "patients"("mobileNumber");
