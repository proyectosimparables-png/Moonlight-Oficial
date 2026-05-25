"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchProducts, Product } from "./useSearchProducts";
import Link from "next/link";
import Image from "next/image";

interface SearchInputProps {
  onResultClick?: () => void;
}

export const SearchInput = ({ onResultClick }: SearchInputProps) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { results, loading } = useSearchProducts(query, 300);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length >= 3) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setShowSuggestions(false);
      if (onResultClick) onResultClick(); // Cierra el menú en mobile
    }
  };

  const handleSelectProduct = () => {
    setQuery("");
    setShowSuggestions(false);
    if (onResultClick) onResultClick(); // Cierra el menú en mobile
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Buscar productos..."
          className="pl-10 w-full bg-white text-black border-gray-300 focus:ring-purple-500 text-base"
        />
      </form>

      {showSuggestions && query.length >= 3 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-2 shadow-2xl z-[100] overflow-hidden">
          {loading && (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-12 h-12 bg-purple-100 animate-pulse rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-purple-100 animate-pulse rounded w-3/4" />
                    <div className="h-2 bg-purple-50 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.exactos.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto md:max-h-80">
              {results.exactos.map((product: Product) => {
                const imgSrc =
                  product.imagenUrl ||
                  product.imagenes?.[0] ||
                  "/placeholder.png";

                return (
                  <Link
                    key={product.id}
                    href={`/productos/${product.slug || product.id}`}
                    onClick={handleSelectProduct}
                    className="flex items-center gap-3 p-4 md:p-3 hover:bg-purple-50 transition-colors border-b last:border-0"
                  >
                    <div className="relative w-12 h-12 md:w-10 md:h-10 shrink-0">
                      <Image
                        src={imgSrc}
                        alt={product.nombre}
                        fill
                        sizes="(max-width: 768px) 48px, 40px"
                        className="object-cover rounded shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {product.nombre}
                      </span>
                      <span className="text-xs text-purple-600 font-bold">
                        {product.precio}
                      </span>
                    </div>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => handleSearch()}
                className="w-full p-4 text-center text-sm text-purple-700 bg-purple-50/50 hover:bg-purple-100 font-bold transition-colors"
              >
                Ver todos los resultados
              </button>
            </div>
          )}

          {!loading && results.exactos.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron coincidencias
            </div>
          )}
        </div>
      )}
    </div>
  );
};
