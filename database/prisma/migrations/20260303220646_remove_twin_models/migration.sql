/*
  Warnings:

  - You are about to drop the `Twin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TwinSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TwinSession" DROP CONSTRAINT "TwinSession_twin_id_fkey";

-- DropTable
DROP TABLE "Twin";

-- DropTable
DROP TABLE "TwinSession";

-- DropEnum
DROP TYPE "TwinSessionStatus";

-- DropEnum
DROP TYPE "TwinSessionType";

-- DropEnum
DROP TYPE "TwinStatus";
