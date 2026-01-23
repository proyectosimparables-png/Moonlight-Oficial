"use client";

import { useEffect, useState } from "react";
import { getProductosPublicos } from "@/services/productos";
import ProductCard from "../home/ProductCard";

interface Producto {
  id: string | number;
  nombre: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl?: string;
}

interface Props {
  titulo: string;
  esTodo?: boolean;
}

export const ProductGridView = ({ titulo, esTodo = false }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Aquí llamamos al servicio que trae el catálogo completo
        const data = await getProductosPublicos();
        setProductos(data);
      } catch (err) {
        console.error("❌ Error al cargar productos:", err);
        setError(
          "No pudimos cargar los productos. Intenta de nuevo más tarde 💜",
        );
      } finally {
        setLoading(false);
      }
    };

    if (esTodo) {
      fetchAllProducts();
    }
  }, [esTodo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 animate-pulse text-[#7b5ca2]">
        Cargando {titulo.toLowerCase()}... 💜
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400 font-medium">{error}</div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center my-8 text-2xl font-semibold text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide">
        {titulo}
      </h1>

      {productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Próximamente cargaremos nuevos productos ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {productos.map((p) => (
            <ProductCard
              key={p.id}
              {...p}
              id={p.id.toString()} // Normalizamos el ID a string para el componente
            />
          ))}
        </div>
      )}
    </div>
  );
};
