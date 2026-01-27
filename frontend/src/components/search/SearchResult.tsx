// src/components/search/SearchResult.tsx

import ProductCard from "../home/ProductCard";

interface SearchResultsProps {
  data?: { // Agregamos el '?' porque puede ser undefined al inicio
    exactos: any[];
    relacionados: any[];
  };
}

export const SearchResults = ({ data }: SearchResultsProps) => {
  // 🛡️ Si data no existe todavía, mostramos un estado de carga o nada
  if (!data) {
    return <div className="text-center p-10">Cargando resultados...</div>;
  }

  // Extraemos con valores por defecto por si las dudas
  const { exactos = [], relacionados = [] } = data;

  if (exactos.length === 0 && relacionados.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No se encontraron productos para esta búsqueda.
      </p>
    );
  }

  return (
    <div className="space-y-12 p-6">
      {/* Sección de Resultados Exactos */}
      {exactos.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-black">Resultados encontrados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {exactos.map((p) => (
              <ProductCard key={p.id} {...p} imagenUrl={p.imagenUrl || p.imagenes?.[0]} />
            ))}
          </div>
        </div>
      )}

      {/* Sección de Relacionados con el diseño del Skeleton Purple */}
      {relacionados.length > 0 && (
        <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
          <h2 className="text-lg font-semibold mb-6 text-purple-800 italic">
            También te podría gustar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} {...p} imagenUrl={p.imagenUrl || p.imagenes?.[0]} imagenHoverUrl={p.imagenHoverUrl} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};