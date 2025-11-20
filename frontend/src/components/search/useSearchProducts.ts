"use client";
import { useState, useEffect } from "react";

export interface Product {
  id: string;
  nombre: string;
  imagenes: { url: string }[];
  precio: string;
}

export function useSearchProducts(query: string, delay = 500) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/search?q=${encodeURIComponent(query)}`
        );

        if (!res.ok) throw new Error("No se encontraron productos");

        const data: Product[] = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        setResults([]);
        setError("No se encontraron productos");
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  return { results, loading, error };
}
