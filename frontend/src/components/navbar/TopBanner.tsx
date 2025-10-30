const TopBanner = () => {
  const text =
    "💳3 CUOTAS SIN INTERÉS!   |  💸10% OFF por transferencia  |  🚚ENVÍO GRATIS a partir de $20.000   |  🔥NUEVAS REBAJAS en productos seleccionados!   |    ";

  return (
    <div className="bg-[#cebbf5] text-gray-500 text-[11px] font-normal select-none overflow-hidden relative h-9 flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="px-4">{text.repeat(20)}</span>
        <span className="px-4">{text.repeat(20)}</span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 300s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TopBanner;
