// app/(cliente)/productos/page.tsx
import { ProductGridView } from "@/components/todos-los-productos/ProductGridView";
import { getProductosPublicos } from "@/services/productos-service";
import { Producto } from "@/types/productos";

export const revalidate = 300;

interface ProductoFormateado {
  id: string;
  nombre: string;
  slug: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl: string | undefined;
  published: boolean;
}

export default async function TodosLosProductosPage() {
  // Traemos todo el catálogo (TypeScript ya sabe que es un array de tipo Producto[])
  const allProducts = await getProductosPublicos();

  // Mapeamos usando el tipo Producto nativo sin forzar conversiones raras
  const formattedProducts: ProductoFormateado[] = (
    allProducts as Producto[]
  ).map((p) => {
    // Si el producto tiene un slug cargado lo usa, sino lo genera a partir del nombre
    const productSlug = p.nombre.toLowerCase().trim().replace(/\s+/g, "-");

    return {
      id: String(p.id),
      nombre: p.nombre,
      slug: productSlug,
      precio:
        typeof p.precio === "number"
          ? `$ ${p.precio.toLocaleString("es-AR")}`
          : String(p.precio),
      // Si no tiene imagenUrl principal, usamos la primera del array de imágenes como fallback
      imagenUrl: p.imagenUrl || p.imagenes[0] || "/placeholder.png",
      // La imagen de hover la extraemos de forma segura de la segunda posición del array de imágenes
      imagenHoverUrl: p.imagenes.length > 1 ? p.imagenes[1] : undefined,
      published: p.published,
    };
  });

  // Pasamos los datos limpios y súper tipados de forma nativa
  return (
    <ProductGridView
      titulo="Todos los productos"
      initialProducts={formattedProducts}
    />
  );
}
