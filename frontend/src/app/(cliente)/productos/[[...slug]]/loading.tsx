export default function LoadingProductos() {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center">
      {/* Spinner elegante con los colores de Moonlight */}
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#d8c4fa] border-t-[#7b5ca2] rounded-full animate-spin"></div>
      </div>

      <div className="mt-6 text-center">
        <h2 className="text-xl font-serif font-medium text-[#6c5b7b] animate-pulse">
          Moonlight
        </h2>
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mt-2">
          Cargando selección... 💜
        </p>
      </div>

      {/* Esqueleto opcional para simular el grid (Skeleton UI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-16 opacity-20">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 w-3/4 mx-auto rounded"></div>
            <div className="h-4 bg-gray-200 w-1/2 mx-auto rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
