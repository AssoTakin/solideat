-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeConnectOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;
