"use client";

import { useEffect, useState } from "react";
import {
  getCategoriasTree,
  getProductosPublicosFiltrados,
} from "@/services/productos";
import ProductCard from "@/components/home/ProductCard";

interface Producto {
  id: string;
  nombre: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl?: string;
}

interface CategoriaTree {
  id: string;
  nombre: string;
  slug: string;
  subcategorias?: CategoriaTree[];
}

interface Props {
  slug?: string[]; // Ahora recibirá ["remeras", "bts"] completo
}

const SECCION_INDUMENTARIA_ID = "4cb075af-f5c6-43c3-91c6-a3b51f4f7d0e";

function findCategoriaByPath(
  categorias: CategoriaTree[],
  path: string[],
): CategoriaTree | null {
  let currentLevel = categorias;
  let foundCategory: CategoriaTree | null = null;

  for (const segment of path) {
    const decodedSegment = decodeURIComponent(segment).toLowerCase();
    const found = currentLevel.find((c) => {
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

export default function IndumentariaView({ slug }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("🔍 URL Slug capturado:", slug);

        const tree: CategoriaTree[] = await getCategoriasTree(
          SECCION_INDUMENTARIA_ID,
        );
        let categoriaIdParaFiltrar: string | undefined = undefined;

        if (slug && slug.length > 0) {
          const categoriaEncontrada = findCategoriaByPath(tree, slug);
          console.log(
            "📍 Categoría identificada en el árbol:",
            categoriaEncontrada,
          );

          if (categoriaEncontrada) {
            categoriaIdParaFiltrar = categoriaEncontrada.id;
          } else {
            console.warn(
              "⚠️ No se encontró coincidencia para el slug en el árbol.",
            );
            setProductos([]);
            setLoading(false);
            return;
          }
        }

        const data: Producto[] = await getProductosPublicosFiltrados({
          seccionId: SECCION_INDUMENTARIA_ID,
          categoriaId: categoriaIdParaFiltrar,
        });

        setProductos(data);
      } catch (error) {
        console.error("❌ Error en la carga:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading)
    return (
      <div className="text-center py-20 animate-pulse">Cargando... 💜</div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {productos.length > 0 ? (
        productos.map((p) => <ProductCard key={p.id} {...p} />)
      ) : (
        <div className="col-span-full text-center py-20 text-gray-500">
          No hay productos aquí todavía 💜
        </div>
      )}
    </div>
  );
}
