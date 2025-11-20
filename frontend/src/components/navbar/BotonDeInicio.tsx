'use client';
import { useRouter } from "next/navigation";


export const VolverInicioButton = () => {
  const router = useRouter();
  return (
    <div className="mt-6 text-center">
      <div className="flex justify-end mt-4">
        <div className="flex justify-end mt-0 mb-4">
          <button
            onClick={() => router.push("/")}
            className="bg-[#7b5ca2] text-white px-4 py-1.5 rounded-md hover:bg-[#6c5b7b] transition-all duration-200"
          >
            ← Volver al inicio
          </button>
        </div>

      </div>

    </div>
  );
};