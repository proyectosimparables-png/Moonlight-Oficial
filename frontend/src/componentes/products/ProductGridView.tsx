"use client";

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
  initialProducts: Producto[]; // Recibimos los productos del servidor
}

export const ProductGridView = ({ titulo, initialProducts = [] }: Props) => {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-center mb-12 text-4xl md:text-5xl font-serif font-bold text-[#6c5b7b] uppercase tracking-tighter">
        {titulo}
      </h1>

      {initialProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg italic font-medium">
            Próximamente cargaremos nuevos productos ✨
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
          {initialProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id.toString()}
              nombre={p.nombre}
              precio={p.precio}
              imagenUrl={p.imagenUrl}
              imagenHoverUrl={p.imagenHoverUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};
