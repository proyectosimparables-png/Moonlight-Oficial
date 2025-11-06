/*
  Warnings:

  - You are about to drop the column `productoId` on the `Comentario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Comentario" DROP CONSTRAINT "Comentario_productoId_fkey";

-- AlterTable
ALTER TABLE "Comentario" DROP COLUMN "productoId";
