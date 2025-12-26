import { SearchResults } from "@/components/search/SearchResult";
import { Product } from "@/components/search/useSearchProducts";

export default async function SearchPage(props: {
  searchParams: { q?: string } | Promise<{ q?: string }>;
}) {
  // ✅ Compatibilidad con Next 14 y 15
  const params = props.searchParams instanceof Promise
    ? await props.searchParams
    : props.searchParams;

  const query = params.q || "";
  let products: Product[] = [];

  if (query.length > 0) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/productos/search?q=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    if (res.ok) products = await res.json();
  }

  const hasResults = products.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#6c5b7b] mb-2">
        Resultados para: “{query}”
      </h1>

      {hasResults ? (
        <p className="text-gray-600 mb-6">
          Se encontraron{" "}
          <span className="font-semibold text-[#7b5ca2]">
            {products.length}
          </span>{" "}
          productos relacionados con “{query}”.
        </p>
      ) : (
        <p className="text-gray-500 mb-6">
          No se encontraron productos para “{query}”.
        </p>
      )}

      <SearchResults products={products} />

      <div className="mt-10 text-center">
        <a
          href="/"
          className="inline-block bg-[#7b5ca2] text-white px-6 py-2 rounded-md hover:bg-[#6c5b7b] transition-all duration-200"
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
