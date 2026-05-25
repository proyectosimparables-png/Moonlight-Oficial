// src/app/(cliente)/search/page.tsx
import { SearchResults } from "@/componentes/search";
import { searchProductos } from "@/services/productos-service";
import { Producto } from "@/types/productos";
import Link from "next/link";

export default async function SearchPage(props: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}) {
  const params =
    props.searchParams instanceof Promise
      ? await props.searchParams
      : props.searchParams;
  const query = params.q || "";

  let searchData: { exactos: Producto[]; relacionados: Producto[] } = {
    exactos: [],
    relacionados: [],
  };

  if (query.length > 0) {
    searchData = await searchProductos(query);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#6c5b7b] mb-2">
        Resultados para: “{query}”
      </h1>

      <p className="text-gray-600 mb-6">
        Encontramos{" "}
        <span className="font-semibold text-[#7b5ca2]">
          {searchData.exactos.length}
        </span>{" "}
        resultados directos.
      </p>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <SearchResults data={searchData as any} />

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block bg-[#7b5ca2] text-white px-6 py-2 rounded-md hover:bg-[#6c5b7b] transition-all duration-200"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
