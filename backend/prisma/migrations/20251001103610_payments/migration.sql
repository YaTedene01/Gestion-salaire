-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('ESPECES', 'VIREMENT', 'ORANGE_MONEY', 'WAVE');

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" "public"."PaymentMode" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptUrl" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
