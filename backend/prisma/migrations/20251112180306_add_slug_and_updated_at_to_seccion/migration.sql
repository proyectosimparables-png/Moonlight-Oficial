/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Seccion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Seccion_nombre_key";

-- AlterTable
ALTER TABLE "Seccion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Seccion_slug_key" ON "Seccion"("slug");
