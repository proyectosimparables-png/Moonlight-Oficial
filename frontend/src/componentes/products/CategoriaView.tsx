"use client";

import { useMemo } from "react";
import ProductCard from "@/componentes/home/ProductCard";

interface Producto {
  id: string;
  nombre: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl?: string;
  categoriaId?: string;
  slug: string;
}

interface CategoriaTree {
  id: string;
  nombre: string;
  slug: string;
  subcategorias?: CategoriaTree[];
}

interface Props {
  categoriaPath: string[];
  initialTree: CategoriaTree[];
  initialProducts: Producto[];
}

const NOMBRES_SECCIONES: Record<string, string> = {
  indumentaria: "Indumentaria",
  "bangtan-limited-edition": "Bangtan Limited Edition",
  "gift-cards": "Gift Cards",
};

function findCategoriaByPath(
  categorias: CategoriaTree[],
  path: string[],
): CategoriaTree | null {
  const rootSlugs = ["indumentaria", "bangtan-limited-edition"];
  const searchPath = rootSlugs.includes(path[0]) ? path.slice(1) : path;
  if (searchPath.length === 0) return null;

  let currentLevel = categorias;
  let foundCategory: CategoriaTree | null = null;

  for (const segment of searchPath) {
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

export const CategoriaView = ({
  categoriaPath = [],
  initialTree = [],
  initialProducts = [],
}: Props) => {
  const { titulo, productosAMostrar } = useMemo(() => {
    const categoriaEncontrada = findCategoriaByPath(initialTree, categoriaPath);

    const nombreTitulo =
      categoriaEncontrada?.nombre ||
      NOMBRES_SECCIONES[categoriaPath[0]] ||
      categoriaPath[0]?.replace(/-/g, " ");

    // IMPORTANTE: Ya no filtramos localmente.
    // Confiamos en lo que mandó el servidor porque él ya incluyó las subcategorías.
    const filtrados = initialProducts;

    return {
      titulo: nombreTitulo,
      productosAMostrar: filtrados,
    };
  }, [categoriaPath, initialTree, initialProducts]);
  console.log("Primer producto:", productosAMostrar[0]);
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#6c5b7b] uppercase tracking-tighter mb-3">
          {titulo}
        </h1>

        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-400 uppercase tracking-[0.2em]">
          <span>Tienda</span>
          <span>/</span>
          <span className="text-[#7b5ca2] font-semibold">
            {categoriaPath.join(" / ").replace(/-/g, " ")}
          </span>
        </div>
        <div className="mt-6 w-16 h-0.5 bg-[#d8c4fa] mx-auto"></div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
        {productosAMostrar.length > 0 ? (
          productosAMostrar.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              id={p.id} // Este es el UUID para el carrito/favoritos
              slug={p.slug} // Este es para la URL
            />
          ))
        ) : (
          <div className="col-span-full text-center py-32 text-gray-400">
            <p className="text-xl font-medium italic">
              No hay productos en esta categoría todavía 💜
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
