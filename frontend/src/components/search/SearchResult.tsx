"use client";

import { Product } from "./useSearchProducts";
import ProductCard from "@/components/home/ProductCard";

interface SearchResultsProps {
  products: Product[];
}

export const SearchResults = ({ products }: SearchResultsProps) => {
  if (products.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No se encontraron productos para esta búsqueda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.nombre}
          image={product.imagenes?.[0]?.url ?? "/placeholder.png"}
          price={String(product.precio ?? "0")}
        />
      ))}
    </div>
  );
};
