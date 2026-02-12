import { notFound } from "next/navigation";
import { CategoriaView } from "@/components/todos-los-productos/CategoriaView";
import { ProductGridView } from "@/components/todos-los-productos/ProductGridView";
import DetailsProducts from "@/components/DetailsProducts";
import {
  getCategoriasTree,
  getProductosPublicosFiltrados,
  getProductosPublicos,
  getProductoBySlug,
} from "@/services/productos";

interface CategoriaNode {
  id: string;
  nombre: string;
  slug: string;
  subcategorias?: CategoriaNode[];
}

const SECCION_INDUMENTARIA_ID = "4cb075af-f5c6-43c3-91c6-a3b51f4f7d0e";
const SECCION_BANGTAN_ID = "f658f354-3122-41d8-93e4-929023d61260";
const ROOT_SLUGS = ["indumentaria", "bangtan-limited-edition"];

/**
 * Busca una categoría dentro del árbol recursivo comparando slugs
 */
function findCategoriaByPath(
  categorias: CategoriaNode[],
  path: string[],
): CategoriaNode | null {
  // Si la URL empieza con una raíz (indumentaria/...), la ignoramos para buscar en el árbol
  const searchPath = ROOT_SLUGS.includes(path[0]) ? path.slice(1) : path;
  if (searchPath.length === 0) return null;

  let currentLevel: CategoriaNode[] = categorias;
  let foundCategory: CategoriaNode | null = null;

  for (const segment of searchPath) {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();

    const found: CategoriaNode | undefined = currentLevel.find((c) => {
      if (!c.slug) return false;
      const normalizedSlug = c.slug.toLowerCase();
      return (
        normalizedSlug === decodedSegment ||
        normalizedSlug === decodedSegment.replace(/\s+/g, "-")
      );
    });

    if (!found) return null;
    foundCategory = found;
    currentLevel = found.subcategorias || [];
  }
  return foundCategory;
}

export default async function ProductosPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;

  // 1. Caso base: /productos
  if (slug.length === 0) {
    const allProducts = await getProductosPublicos();
    return (
      <ProductGridView
        titulo="Todos los productos"
        initialProducts={allProducts}
      />
    );
  }

  const lastPart = slug[slug.length - 1];
  const isBangtan = slug[0] === "bangtan-limited-edition";
  const seccionId = isBangtan ? SECCION_BANGTAN_ID : SECCION_INDUMENTARIA_ID;

  // --- SOLUCIÓN: Intentar producto sin romper el flujo ---
  let product = null;
  if (!ROOT_SLUGS.includes(lastPart)) {
    try {
      product = await getProductoBySlug(lastPart);
    } catch (e) {
      // Si no es un producto, simplemente guardamos null y seguimos
      product = null;
    }
  }

  // 2. Si es un producto, mostrar detalle
  if (product) {
    return <DetailsProducts initialProduct={product} />;
  }

  // 3. Si no fue producto, cargar el árbol y buscar categoría
  const tree = await getCategoriasTree(seccionId);
  const categoriaEncontrada = findCategoriaByPath(tree, slug);

  // 4. Si no es categoría ni raíz válida, 404
  if (!categoriaEncontrada && !ROOT_SLUGS.includes(slug[0])) {
    return notFound();
  }

  // 5. Cargar productos de la categoría o sección
  const products = await getProductosPublicosFiltrados({
    seccionId,
    categoriaId: categoriaEncontrada?.id,
  });

  return (
    <CategoriaView
      categoriaPath={slug}
      initialTree={tree}
      initialProducts={products}
    />
  );
}
