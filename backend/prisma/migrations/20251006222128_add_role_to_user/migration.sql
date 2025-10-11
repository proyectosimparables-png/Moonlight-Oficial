-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CLIENTE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'CLIENTE';
