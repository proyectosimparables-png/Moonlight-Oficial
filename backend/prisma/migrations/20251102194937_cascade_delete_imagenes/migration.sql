-- DropForeignKey
ALTER TABLE "public"."Imagen" DROP CONSTRAINT "Imagen_productoId_fkey";

-- AddForeignKey
ALTER TABLE "Imagen" ADD CONSTRAINT "Imagen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
