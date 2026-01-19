'use client';
export interface Product {
  id: string;
  nombre: string;
  imagenes: { url: string }[];
  precio: string;
}

// El formato que viene del Backend ahora
export interface SearchResponse {
  exactos: Product[];
  relacionados: Product[];
}

import { useState, useEffect } from "react";

export function useSearchProducts(query: string, delay = 500) {
  // Inicializamos con el objeto correcto
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
        }
      } catch (err) {
        setResults({ exactos: [], relacionados: [] });
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  return { results, loading };
}