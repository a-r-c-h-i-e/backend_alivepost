/*
  Warnings:

  - You are about to drop the column `exersice` on the `prescriptions` table. All the data in the column will be lost.
  - Changed the type of `mobileNumber` on the `doctors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `mobileNumber` on the `patients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "mobileNumber",
ADD COLUMN     "mobileNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "mobileNumber",
ADD COLUMN     "mobileNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "exersice",
ADD COLUMN     "exercise" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "doctors_mobileNumber_key" ON "doctors"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mobileNumber_key" ON "patients"("mobileNumber");
