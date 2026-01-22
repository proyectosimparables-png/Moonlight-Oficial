"use client";

import { useEffect, useState } from "react";
import {
  getCategorias,
  getProductosPublicosFiltrados,
} from "@/services/productos";
import ProductCard from "../home/ProductCard";

interface Producto {
  id: string;
  nombre: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl?: string;
}

const BangtanBags = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const seccionId = "f658f354-3122-41d8-93e4-929023d61260";
  const categoriaNombre = "Bangtan Bags";

  useEffect(() => {
    const cargarCategoria = async () => {
      try {
        setError(null);

        const categorias = await getCategorias(seccionId);

        const categoria = categorias.find(
          (cat: { nombre: string }) =>
            cat.nombre.toLowerCase() === categoriaNombre.toLowerCase(),
        );

        if (!categoria) {
          setError("Categoría Bangtan Bags no encontrada");
          setCargando(false);
          return;
        }

        setCategoriaId(categoria.id);
      } catch {
        setError("Error cargando categorías");
        setCargando(false);
      }
    };

    cargarCategoria();
  }, []);

  useEffect(() => {
    if (!categoriaId) return;

    const cargarProductos = async () => {
      try {
        const data = await getProductosPublicosFiltrados({
          seccionId,
          categoriaId,
        });

        setProductos(data);
      } catch {
        setError("Error cargando productos");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [categoriaId]);

  if (cargando) return <div>Cargando Bangtan Bags...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1 className="text-center my-6 text-xl font-semibold">Bangtan Bags</h1>

      {productos.length === 0 ? (
        <p className="text-center text-gray-500 my-10">
          Próximamente cargaremos los productos de Bangtan Bags 💜
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              id={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              imagenUrl={producto.imagenUrl}
              imagenHoverUrl={producto.imagenHoverUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BangtanBags;
