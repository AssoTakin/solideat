-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionStatus" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false;
