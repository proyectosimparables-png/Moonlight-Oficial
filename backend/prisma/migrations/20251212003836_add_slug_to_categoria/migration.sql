/*
  Warnings:

  - You are about to drop the column `parentId` on the `Categoria` table. All the data in the column will be lost.
  - Made the column `updatedAt` on table `Seccion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Categoria" DROP CONSTRAINT "Categoria_parentId_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP COLUMN "parentId",
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Seccion" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
