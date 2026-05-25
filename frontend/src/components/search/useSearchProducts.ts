'use client';



import { useState, useEffect } from "react";


export interface Product {
  id: string;
  slug: string; // ✅ Aseguramos que el slug esté en la interfaz
  nombre: string;

  // CAMBIO: Tu formateador hace imagenes: producto.imagenes?.map((img) => img.url)
  // Por lo tanto, ahora es un array de strings, no de objetos.
  imagenes: string[]; 
  // CAMBIO: Agregamos esta que es la que ya viene lista para usar
  imagenUrl: string;   

  //imagenes: { url: string }[] | string[];

  precio: string;
}

export interface SearchResponse {
  exactos: Product[];
  relacionados: Product[];
}

export function useSearchProducts(query: string, delay = 500) {
  const [results, setResults] = useState<SearchResponse>({ exactos: [], relacionados: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults({ exactos: [], relacionados: [] });
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        // ✅ AJUSTE: Usamos 'q=' porque así está en tu ProductoController
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
        }
      } catch (err) {

        console.error("Error en búsqueda:", err);


        setResults({ exactos: [], relacionados: [] });
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  return { results, loading };
}