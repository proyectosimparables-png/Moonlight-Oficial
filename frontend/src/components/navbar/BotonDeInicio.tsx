"use client";

import { useRouter } from "next/navigation";

export const VolverInicioButton = () => {
  const router = useRouter();

  return (
    <div className="mt-6 flex justify-center sm:justify-end">
      <button
        onClick={() => router.push("/")}
        className="bg-[#7b5ca2] text-white px-5 py-2 rounded-md hover:bg-[#6c5b7b] transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-95"
      >
        <span>←</span> Volver al inicio
      </button>
    </div>
  );
};
