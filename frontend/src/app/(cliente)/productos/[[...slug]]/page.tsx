import { CategoriaView } from "@/components/todos-los-productos/CategoriaView";
import { ProductGridView } from "@/components/todos-los-productos/ProductGridView";
import DetailsProducts from "@/components/DetailsProducts";
import {
  getCategoriasTree,
  getProductosPublicosFiltrados,
  getProductosPublicos,
} from "@/services/productos";

interface CategoriaNode {
  id: string;
  nombre: string;
  slug: string;
  subcategorias?: CategoriaNode[];
}

const SECCION_INDUMENTARIA_ID = "4cb075af-f5c6-43c3-91c6-a3b51f4f7d0e";
const SECCION_BANGTAN_ID = "f658f354-3122-41d8-93e4-929023d61260";

function findCategoriaByPath(
  categorias: CategoriaNode[],
  path: string[],
): CategoriaNode | null {
  const rootSlugs = ["indumentaria", "bangtan-limited-edition"];
  const searchPath = rootSlugs.includes(path[0]) ? path.slice(1) : path;
  if (searchPath.length === 0) return null;
  let currentLevel: CategoriaNode[] = categorias;
  let foundCategory: CategoriaNode | null = null;
  for (const segment of searchPath) {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();
    const found: CategoriaNode | undefined = currentLevel.find((c) => {
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

  // OPTIMIZACIÓN 1: El detalle del producto se busca en paralelo con la posibilidad de que sea categoría
  // Pero para simplificar, lo dejamos así o lo movemos a una ruta dinámica [id].
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/productos/${lastPart}`,
      {
        next: { revalidate: 3600 }, // Aumentamos caché a 1 hora
      },
    );
    if (res.ok) {
      const product = await res.json();
      return <DetailsProducts initialProduct={product} />;
    }
  } catch (e) {}

  const isBangtan = slug[0] === "bangtan-limited-edition";
  const seccionId = isBangtan ? SECCION_BANGTAN_ID : SECCION_INDUMENTARIA_ID;

  // OPTIMIZACIÓN 2: Paralelismo y uso de caché
  // Traemos el árbol primero porque lo necesitamos para el ID
  const tree: CategoriaNode[] = await getCategoriasTree(seccionId);
  const categoriaEncontrada = findCategoriaByPath(tree, slug);

  // OPTIMIZACIÓN 3: Solo pedimos los productos necesarios
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
