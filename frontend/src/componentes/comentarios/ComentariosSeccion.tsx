"use client";

import { useEffect, useState } from "react";
import { getComentarios } from "@/services/comentarios-service";

interface Comentario {
  id: string;
  contenido: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export default function UltimosComentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  useEffect(() => {
    getComentarios(5).then(setComentarios);
  }, []);

  return (
    <section className="max-w-6xl mx-auto py-10 px-4 sm:px-6 bg-[var(--color-soft-beige)] rounded-2xl shadow-md mt-10">
      <h2
        className="text-2xl sm:text-3xl font-bold mb-8 text-center"
        style={{ color: "var(--color-dark)" }}
      >
        Ustedes 💜
      </h2>

      {comentarios.length === 0 ? (
        <p className="text-gray-500 text-center text-sm sm:text-base">
          Aún no hay comentarios disponibles.
        </p>
      ) : (
        <div
          className="
            flex gap-4 sm:gap-6 overflow-x-auto pb-4
            scrollbar-thin scrollbar-thumb-[var(--color-lilac)]
            scrollbar-track-[var(--color-soft-beige)]
            snap-x snap-mandatory
          "
        >
          {comentarios.map((c) => (
            <div
              key={c.id}
              className="
                snap-center flex-shrink-0
                bg-[var(--color-pastel-lilac)]
                rounded-xl p-5 shadow-sm border border-[var(--color-hover)]
                hover:shadow-lg hover:scale-[1.02] transition-all duration-300
                min-w-[85%] sm:min-w-[320px] md:min-w-[280px]
              "
            >
              {/* 👩 Nombre */}
              <p className="font-semibold text-[var(--color-dark)] mb-2 text-sm sm:text-base">
                {c.user.name}
              </p>

              {/* 💬 Comentario */}
              <p className="text-gray-800 italic text-sm sm:text-base mb-3 line-clamp-5">
                “{c.contenido}”
              </p>

              {/* 📅 Fecha */}
              <p className="text-xs text-gray-500 text-right">
                {new Date(c.createdAt).toLocaleDateString("es-AR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
