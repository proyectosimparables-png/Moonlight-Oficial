/*
  Warnings:

  - You are about to drop the column `seccionId` on the `Producto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_seccionId_fkey";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "seccionId";

-- CreateTable
CREATE TABLE "ProductoSeccion" (
    "productoId" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,

    CONSTRAINT "ProductoSeccion_pkey" PRIMARY KEY ("productoId","seccionId")
);

-- AddForeignKey
ALTER TABLE "ProductoSeccion" ADD CONSTRAINT "ProductoSeccion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoSeccion" ADD CONSTRAINT "ProductoSeccion_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "Seccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
