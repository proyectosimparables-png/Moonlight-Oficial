// app/(cliente)/[...seccion]/page.tsx
import { notFound } from "next/navigation";
import { CategoriaView } from "@/components/products/Categoria-View";
import DetailsProducts from "@/components/products/Product-Detail-View";
import {
  getSeccionBySlug,
  getProductosPublicosFiltrados,
  getCategoriasTree,
  getProductoBySlug,
} from "@/services/products-service";
import { Producto } from "@/types/products";

export const revalidate = 300;

interface CategoriaTreeLocal {
  id: string;
  nombre: string;
  slug: string;
  subcategorias?: CategoriaTreeLocal[];
}

interface ProductoFormateado {
  id: string;
  nombre: string;
  slug: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl: string | undefined;
  published: boolean;
}

interface ObjetoDinamico {
  id: string;
  nombre: string;
  slug?: string | null;
  subcategorias?: ObjetoDinamico[];
  subCategories?: ObjetoDinamico[];
  [key: string]: unknown;
}

export default async function RouterDinamicoPage({
  params,
}: {
  params: { seccion?: string[] };
}) {
  const resolvedParams = await params;
  const seccion = resolvedParams?.seccion || [];

  if (seccion.length === 0) {
    return notFound();
  }

  const slugPrimerNivel = seccion[0].toLowerCase().trim();
  const rutasIgnoradas = [
    "admin",
    "login",
    "cart",
    "cuenta",
    "productos",
    "favicon.ico",
    "api",
  ];
  if (rutasIgnoradas.includes(slugPrimerNivel)) {
    return notFound();
  }

  // ====================================================================
  // RUTAS RAÍZ (LONGITUD 1)
  // ====================================================================
  if (seccion.length === 1) {
    const [posibleProducto, seccionEncontrada] = await Promise.all([
      getProductoBySlug(slugPrimerNivel).catch(() => null),
      getSeccionBySlug(slugPrimerNivel).catch(() => null),
    ]);

    if (posibleProducto && posibleProducto.published) {
      return <DetailsProducts initialProduct={posibleProducto} />;
    }

    if (!seccionEncontrada) return notFound();

    const [rawTree, rawProducts] = await Promise.all([
      getCategoriasTree(seccionEncontrada.id).catch(() => []),
      getProductosPublicosFiltrados({ seccionId: seccionEncontrada.id }).catch(
        () => [],
      ),
    ]);

    return renderizarCatálogo(
      seccion,
      rawTree as ObjetoDinamico[],
      rawProducts as Producto[],
    );
  }

  // ====================================================================
  // RUTAS PROFUNDAS (LONGITUD > 1)
  // ====================================================================
  const seccionEncontrada = await getSeccionBySlug(slugPrimerNivel);

  if (!seccionEncontrada) return notFound();

  const rawTree = await getCategoriasTree(seccionEncontrada.id).catch(() => []);
  const tree = (rawTree as ObjetoDinamico[]) || [];

  const ultimoSlugTarget = seccion[seccion.length - 1]
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  let queryCategoriaId: string | undefined = undefined;

  function encontrarCategoriaEnArbol(nodos: ObjetoDinamico[]): boolean {
    for (const nodo of nodos) {
      const nodoSlug = (nodo.slug || nodo.nombre || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
      if (
        nodoSlug === ultimoSlugTarget ||
        nodoSlug === ultimoSlugTarget.replace(/s$/, "")
      ) {
        queryCategoriaId = nodo.id;
        return true;
      }
      const hijos = nodo.subcategorias || nodo.subCategories || [];
      if (hijos.length > 0 && encontrarCategoriaEnArbol(hijos)) return true;
    }
    return false;
  }
  encontrarCategoriaEnArbol(tree);

  if (!queryCategoriaId) return notFound();

  const rawProducts = await getProductosPublicosFiltrados({
    seccionId: seccionEncontrada.id,
    categoriaId: queryCategoriaId,
  }).catch(() => []);

  return renderizarCatálogo(seccion, tree, rawProducts as Producto[]);
}

function mapearArbolSeguro(nodos: ObjetoDinamico[]): CategoriaTreeLocal[] {
  return nodos.map((nodo) => ({
    id: nodo.id,
    nombre: nodo.nombre,
    slug:
      nodo.slug ||
      nodo.nombre.toLowerCase().trim().replace(/\s+/g, "-") ||
      nodo.id,
    subcategorias:
      nodo.subcategorias || nodo.subCategories
        ? mapearArbolSeguro(
            (nodo.subcategorias || nodo.subCategories) as ObjetoDinamico[],
          )
        : [],
  }));
}

function renderizarCatálogo(
  seccion: string[],
  tree: ObjetoDinamico[],
  rawProducts: Producto[],
) {
  const formattedProducts: ProductoFormateado[] = rawProducts.map((p) => ({
    id: String(p.id),
    nombre: p.nombre,
    slug: p.nombre.toLowerCase().trim().replace(/\s+/g, "-"),
    precio:
      typeof p.precio === "number"
        ? `$ ${p.precio.toLocaleString("es-AR")}`
        : String(p.precio),
    imagenUrl: p.imagenUrl || p.imagenes?.[0] || "/placeholder.png",
    imagenHoverUrl: p.imagenes?.length > 1 ? p.imagenes[1] : undefined,
    published: p.published,
  }));

  const safeTree = mapearArbolSeguro(tree);

  return (
    <CategoriaView
      categoriaPath={seccion}
      initialTree={safeTree}
      initialProducts={formattedProducts}
    />
  );
}
