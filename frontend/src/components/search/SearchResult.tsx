// src/components/search/SearchResult.tsx

import ProductCard from "../home/ProductCard";

// ✅ Definimos la interfaz estricta para el Producto
interface ProductData {
  id: string;
  slug: string;
  nombre: string;
  precio: string;
  imagenes?: Array<{ url: string } | string>; // Soporta objeto {url: ""} o string directo
}

// ✅ Definimos la interfaz para la prop data
interface SearchResponseData {
  exactos: ProductData[];
  relacionados: ProductData[];
}

interface SearchResultsProps {
  data?: SearchResponseData;
}

export const SearchResults = ({ data }: SearchResultsProps) => {
  // 🛡️ Estado de carga inicial
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

  // 🛡️ Manejo de búsqueda sin resultados
  if (exactos.length === 0 && relacionados.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-xl text-[#6c5b7b] font-medium">
          No encontramos coincidencias para tu búsqueda.
        </p>
        <p className="text-gray-500 mt-2">
          Intenta con palabras clave más simples o revisa la ortografía.
        </p>
      </div>
    );
  }

  // 🛠️ Función para normalizar la URL de la imagen sin usar 'any'
  const getImageUrl = (producto: ProductData): string => {
    const primeraImagen = producto.imagenes?.[0];
    if (!primeraImagen) return "/placeholder.png";

    if (typeof primeraImagen === "string") {
      return primeraImagen;
    }
    return primeraImagen.url;
  };

  return (
    <div className="space-y-12 p-6">
      {/* Sección de Resultados Exactos */}
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
                slug={p.slug} // ✅ Crucial para navegación amigable
                nombre={p.nombre}
                precio={p.precio}
                imagenUrl={getImageUrl(p)}
              />

            ))}
          </div>
        </section>
      )}

      {/* Sección de Relacionados */}
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
                slug={p.slug} // ✅ Crucial para navegación amigable
                nombre={p.nombre}
                precio={p.precio}
                imagenUrl={getImageUrl(p)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
