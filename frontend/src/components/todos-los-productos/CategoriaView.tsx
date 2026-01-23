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
  categoriaPath?: string[];
}

// IDs de secciones (Asegúrate de que coincidan con tu base de datos)
const SECCION_INDUMENTARIA_ID = "4cb075af-f5c6-43c3-91c6-a3b51f4f7d0e";
const SECCION_BANGTAN_ID = "f658f354-3122-41d8-93e4-929023d61260";

// Mapeo de nombres para las secciones raíz
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

export const CategoriaView = ({ categoriaPath = [] }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nombreCategoriaActual, setNombreCategoriaActual] =
    useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const isBangtan = categoriaPath[0] === "bangtan-limited-edition";
        const seccionIdActiva = isBangtan
          ? SECCION_BANGTAN_ID
          : SECCION_INDUMENTARIA_ID;

        const tree: CategoriaTree[] = await getCategoriasTree(seccionIdActiva);
        let categoriaIdParaFiltrar: string | undefined = undefined;

        // Determinamos el título inicial basado en la sección
        let titulo =
          NOMBRES_SECCIONES[categoriaPath[0]] ||
          categoriaPath[0]?.replace(/-/g, " ");

        if (categoriaPath.length > 0) {
          const categoriaEncontrada = findCategoriaByPath(tree, categoriaPath);

          if (categoriaEncontrada) {
            categoriaIdParaFiltrar = categoriaEncontrada.id;
            titulo = categoriaEncontrada.nombre; // Si encontramos la categoría, usamos su nombre real (ej: "Remeras")
          } else if (categoriaPath.length > 1) {
            setProductos([]);
            setLoading(false);
            return;
          }
        }

        setNombreCategoriaActual(titulo);

        const data: Producto[] = await getProductosPublicosFiltrados({
          seccionId: seccionIdActiva,
          categoriaId: categoriaIdParaFiltrar,
        });

        setProductos(data);
      } catch (error) {
        console.error("❌ Error en CategoriaView:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoriaPath]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 animate-pulse text-[#7b5ca2]">
        Cargando productos... 💜
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      {/* --- HEADER DE CATEGORÍA --- */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#6c5b7b] uppercase tracking-tighter mb-3">
          {nombreCategoriaActual}
        </h1>

        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-400 uppercase tracking-[0.2em]">
          <span>Tienda</span>
          <span>/</span>
          <span className="text-[#7b5ca2] font-semibold">
            {categoriaPath.join(" / ").replace(/-/g, " ")}
          </span>
        </div>

        <div className="mt-6 w-16 h-[2px] bg-[#d8c4fa] mx-auto"></div>
      </header>

      {/* --- GRID DE PRODUCTOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
        {productos.length > 0 ? (
          productos.map((p) => <ProductCard key={p.id} {...p} />)
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
