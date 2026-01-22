"use client";

import React, { useEffect, useState } from "react";
import { getProductosPublicos } from "@/services/productos";
import ProductCard from "../home/ProductCard";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  imagenUrl: string;
  imagenHoverUrl?: string;
}

const TodosLosProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setError(null);

        const data = await getProductosPublicos();
        setProductos(data);
      } catch {
        setError("Hubo un error al cargar los productos");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  if (cargando) return <div>Cargando productos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1 className="text-center my-6 text-xl font-semibold">
        Todos los productos
      </h1>

      {productos.length === 0 ? (
        <p className="text-center text-gray-500 my-10">
          Próximamente cargaremos nuevos productos ✨
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              id={producto.id.toString()}
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

export default TodosLosProductos;
