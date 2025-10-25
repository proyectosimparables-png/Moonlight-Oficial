/*
  Warnings:

  - You are about to drop the column `tipoPrendaId` on the `Categoria` table. All the data in the column will be lost.
  - You are about to drop the column `tipoPrendaId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `TipoPrenda` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Categoria" DROP CONSTRAINT "Categoria_tipoPrendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_tipoPrendaId_fkey";

-- AlterTable
ALTER TABLE "Categoria" DROP COLUMN "tipoPrendaId";

-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "tipoPrendaId",
ALTER COLUMN "categoriaId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."TipoPrenda";

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
