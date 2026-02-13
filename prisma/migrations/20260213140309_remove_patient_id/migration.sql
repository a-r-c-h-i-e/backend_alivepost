/*
  Warnings:

  - You are about to drop the column `patient_id` on the `patients` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "patients_patient_id_key";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "patient_id";
