/*
  Warnings:

  - You are about to drop the column `tipoPrendaId` on the `Categoria` table. All the data in the column will be lost.
  - You are about to drop the column `seccionId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `tipoPrendaId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `TipoPrenda` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `categoriaId` on table `Producto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Categoria" DROP CONSTRAINT "Categoria_tipoPrendaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_seccionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_tipoPrendaId_fkey";

-- DropIndex
DROP INDEX "public"."Categoria_nombre_key";

-- AlterTable
ALTER TABLE "public"."Categoria" DROP COLUMN "tipoPrendaId",
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "seccionId" TEXT;

-- AlterTable
ALTER TABLE "public"."Producto" DROP COLUMN "seccionId",
DROP COLUMN "tipoPrendaId",
ALTER COLUMN "categoriaId" SET NOT NULL;

-- DropTable
DROP TABLE "public"."TipoPrenda";

-- AddForeignKey
ALTER TABLE "public"."Producto" ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "public"."Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Categoria" ADD CONSTRAINT "Categoria_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Categoria" ADD CONSTRAINT "Categoria_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "public"."Seccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
