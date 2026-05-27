-- AlterTable
ALTER TABLE "Meal" ADD COLUMN     "cuisine" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blurAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideActivityHistory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "incognitoMode" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "hidePhoneNumber" SET DEFAULT true;
