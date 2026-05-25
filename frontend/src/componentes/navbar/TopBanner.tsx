"use client";

const TopBanner = () => {
  const message =
    "💳 3 CUOTAS SIN INTERÉS! | 💸 10% OFF por transferencia | 🚚 ENVÍO GRATIS a partir de $20.000 | 🔥 NUEVAS REBAJAS en productos seleccionados!";

  return (
    <div className="bg-[#cebbf5] text-gray-600 text-[11px] font-medium select-none overflow-hidden h-9 flex items-center border-b border-white/10">
      <div className="flex whitespace-nowrap min-w-full">
        {/* Renderizamos el mensaje 4 veces es suficiente para cubrir el ancho y hacer el loop infinito */}
        <div className="flex animate-marquee-infinite">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="px-8 uppercase tracking-wider">
              {message}
            </span>
          ))}
        </div>
        {/* Duplicamos el bloque para el efecto infinito sin saltos */}
        <div className="flex animate-marquee-infinite">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="px-8 uppercase tracking-wider">
              {message}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee-infinite {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopBanner;
