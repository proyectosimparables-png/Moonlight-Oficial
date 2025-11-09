/*
  Warnings:

  - A unique constraint covering the columns `[userId,productoId]` on the table `Favorito` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Favorito_userId_productoId_key" ON "Favorito"("userId", "productoId");
