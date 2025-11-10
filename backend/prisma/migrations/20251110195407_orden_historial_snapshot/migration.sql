/*
  Warnings:

  - You are about to drop the column `cantidad` on the `Orden` table. All the data in the column will be lost.
  - You are about to drop the column `productoId` on the `Orden` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Historial" DROP CONSTRAINT "Historial_productoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Orden" DROP CONSTRAINT "Orden_productoId_fkey";

-- AlterTable
ALTER TABLE "Historial" ADD COLUMN     "imagenUrl" TEXT,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "precio" DOUBLE PRECISION,
ALTER COLUMN "productoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Orden" DROP COLUMN "cantidad",
DROP COLUMN "productoId";

-- CreateTable
CREATE TABLE "OrdenItem" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "productoId" TEXT,
    "imagenUrl" TEXT,

    CONSTRAINT "OrdenItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Orden_userId_idx" ON "Orden"("userId");

-- AddForeignKey
ALTER TABLE "OrdenItem" ADD CONSTRAINT "OrdenItem_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
