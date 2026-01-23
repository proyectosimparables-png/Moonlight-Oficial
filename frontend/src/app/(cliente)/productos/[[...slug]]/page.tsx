import { CategoriaView } from "@/components/todos-los-productos/CategoriaView";
import { ProductGridView } from "@/components/todos-los-productos/ProductGridView";
import DetailsProducts from "@/components/DetailsProducts";

export default async function ProductosPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;

  // 1. Si la URL es solo /productos, muestra el grid general
  if (slug.length === 0) {
    return <ProductGridView titulo="Todos los productos" esTodo={true} />;
  }

  // 2. Lógica para detectar si es un PRODUCTO individual
  // Usamos la última parte del slug (por ejemplo, el ID o el nombre único)
  const lastPart = slug[slug.length - 1];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/productos/${lastPart}`,
      {
        cache: "no-store",
      },
    );

    if (res.ok) {
      const product = await res.json();
      // Si la API nos devuelve un producto válido, mostramos el detalle
      return <DetailsProducts initialProduct={product} />;
    }
  } catch (error) {
    console.error(
      "Error buscando producto, reintentando como categoría:",
      error,
    );
  }

  // 3. Si no fue un producto, CategoriaView maneja el slug como una ruta de categorías
  return <CategoriaView categoriaPath={slug} />;
}
