-- CreateEnum
CREATE TYPE "public"."PeriodType" AS ENUM ('MENSUEL', 'HEBDO', 'JOURNALIER');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'FCFA',
    "period" "public"."PeriodType" NOT NULL DEFAULT 'MENSUEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
