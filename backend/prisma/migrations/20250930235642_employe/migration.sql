-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('JOURNALIER', 'FIXE', 'HONORAIRE');

-- CreateTable
CREATE TABLE "public"."Employee" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "contractType" "public"."ContractType" NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "bankDetails" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
