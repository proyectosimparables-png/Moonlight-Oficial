"use client";

import { useEffect, useState } from "react";
import { getComentarios } from "@/services/comentarios";
import Image from "next/image";

interface Comentario {
  id: string;
  contenido: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function UltimosComentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  useEffect(() => {
    // 👇 solo traemos los 5 más recientes
    getComentarios(5).then(setComentarios);
  }, []);

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 bg-[var(--color-soft-beige)] rounded-xl shadow-md mt-10">
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: "var(--color-dark)" }}
      >
        Lo que dicen nuestros clientes 💜
      </h2>

      {comentarios.length === 0 ? (
        <p className="text-gray-500 text-center">
          Aún no hay comentarios disponibles.
        </p>
      ) : (
        <ul className="space-y-6">
          {comentarios.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 border-b border-gray-200 pb-3"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={c.user.image || "/default-avatar.png"}
                  alt={c.user.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{c.user.name}</p>
                <p className="text-sm text-gray-500">{c.user.email}</p>
                <p className="mt-1 text-gray-700">{c.contenido}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleDateString("es-ES")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
