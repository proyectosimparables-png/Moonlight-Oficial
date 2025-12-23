"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { searchProductos, Producto } from "@/services/productos";

interface SearchInputProps {
  placeholder?: string;
}

export const SearchInput = ({
  placeholder = "Buscar productos...",
}: SearchInputProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchProductos(query);
        setResults(data);
      } catch (err) {
        console.error("Error en searchProductos:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleClick = (id: string) => {
    router.push(`/products/${id}`);
    setResults([]);
    setQuery("");
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7b5ca2]" />

      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="
          pl-10 w-full bg-[#FAFCEF]
          border border-[#d8cbed]
          rounded-md text-sm text-[#a993c2]
          placeholder:text-[#a993c2]
          focus:border-[#a993c2]
          focus:ring-2 focus:ring-[#cbb7e5]
          transition-all duration-200
        "
      />

      {loading && (
        <p className="absolute mt-1 text-sm text-gray-500">Cargando...</p>
      )}

      {results.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded-md max-h-72 overflow-auto shadow-md">
          {results.map((p) => {
            const imagen = p.imagenes?.[0]?.url ?? "/placeholder.png";
            const seccion = p.categoria?.seccion?.nombre ?? "Sin sección";
            const categoria = p.categoria?.nombre ?? "Sin categoría";

            return (
              <li
                key={p.id}
                onClick={() => handleClick(p.id)}
                className="flex items-center p-2 hover:bg-[#f0e5ff] cursor-pointer gap-2"
              >
                <img
                  src={imagen}
                  alt={p.nombre}
                  className="w-10 h-10 object-cover rounded"
                />

                <div className="flex flex-col text-sm">
                  <span className="font-medium text-[#5b3e96]">{p.nombre}</span>

                  <span className="text-[#a993c2] text-xs">
                    {seccion} / {categoria}
                  </span>

                  <span className="text-[#7b5ca2] text-xs font-semibold">
                    ${p.precio}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
