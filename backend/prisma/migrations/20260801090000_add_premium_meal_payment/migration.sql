-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeConnectedAccountId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeConnectedAccountId_key" ON "User"("stripeConnectedAccountId");

-- AlterTable
ALTER TABLE "Meal" ADD COLUMN IF NOT EXISTS "platformFeeAmount" DOUBLE PRECISION;
ALTER TABLE "Meal" ADD COLUMN IF NOT EXISTS "netAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payoutAmount" DOUBLE PRECISION;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "payoutTransferId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Reservation_stripePaymentIntentId_key" ON "Reservation"("stripePaymentIntentId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "cookId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_reservationId_key" ON "Transaction"("reservationId");
CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_stripePaymentIntentId_key" ON "Transaction"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
