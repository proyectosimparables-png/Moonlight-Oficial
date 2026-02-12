// src/components/search/SearchResult.tsx

import ProductCard from "../home/ProductCard";
import { Product } from "./useSearchProducts"; // Importamos la interfaz global que ya definimos

interface SearchResultsProps {
  data?: {
    exactos: Product[];
    relacionados: Product[];
  };
}

export const SearchResults = ({ data }: SearchResultsProps) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
        <span className="ml-3 text-gray-600 font-medium">
          Cargando resultados...
        </span>
      </div>
    );
  }

  const { exactos = [], relacionados = [] } = data;

  if (exactos.length === 0 && relacionados.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-xl text-[#6c5b7b] font-medium">
          No encontramos coincidencias para tu búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-6">
      {exactos.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-100 pb-2">
            Resultados encontrados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exactos.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                nombre={p.nombre}
                precio={p.precio}
                // Usamos la propiedad que ya viene lista del hook
                imagenUrl={p.imagenUrl || p.imagenes?.[0] || "/placeholder.png"}
              />
            ))}
          </div>
        </section>
      )}

      {relacionados.length > 0 && (
        <section className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
          <h2 className="text-lg font-semibold mb-6 text-purple-800 italic">
            También te podría gustar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relacionados.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                nombre={p.nombre}
                precio={p.precio}
                imagenUrl={p.imagenUrl || p.imagenes?.[0] || "/placeholder.png"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
