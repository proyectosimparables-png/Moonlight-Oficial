"use client";

import { useEffect, useState } from "react";
import { getComentarios, createComentario } from "@/services/comentarios";
import { Send } from "lucide-react";

type Comentario = {
  id: number;
  contenido: string;
  nombre?: string;
};

type Star = Comentario & {
  x: number;
  y: number;
};

export default function MoonlightExperience() {
  const [stars, setStars] = useState<Star[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);

  const MAX_CHARS = 150;

  useEffect(() => {
    fetchComentarios();
  }, []);

  const fetchComentarios = async () => {
    try {
      const data: Comentario[] = await getComentarios();
      // Posicionamiento de las estrellas (ajustado para que no toquen bordes)
      const positioned = data.map((c, i) => ({
        ...c,
        x: 10 + ((i * 18) % 80),
        y: 20 + ((i * 25) % 60),
      }));
      setStars(positioned);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim() || enviando) return;

    try {
      setEnviando(true);
      const nuevo = await createComentario(contenido, nombre);

      // Generar una nueva posición aleatoria pero centrada
      const nuevaStar: Star = {
        ...nuevo,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
      };

      setStars((prev) => [...prev, nuevaStar]);
      setContenido("");
      setNombre("");
    } catch (error) {
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="w-full px-4 py-10 bg-[#fdf2f8]">
      {/* 1. SECCIÓN DE CONSTELACIÓN (Sola) */}
      <div
        // CORRECCIÓN: min-h-200 (desde tailwind.config) y bg-linear-to-b (sugerencia de TW)
        className="relative w-full h-[600px] overflow-hidden 
        bg-linear-to-b from-[#4c1d95] via-[#a855f7] to-[#f9a8d4] rounded-[50px] shadow-2xl"
      >
        {/* Estrellas de fondo (pulsando muy suave) */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute bg-white/30 rounded-full animate-pulse" // Pulso estándar suave
            style={{
              width: "2px",
              height: "2px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 2}s`, // Variar velocidad de fondo
            }}
          />
        ))}

        {/* Líneas de Constelación */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {stars.map((s, i) =>
            stars[i + 1] ? (
              <line
                key={`line-${s.id}`}
                x1={`${s.x}%`}
                y1={`${s.y}%`}
                x2={`${stars[i + 1].x}%`}
                y2={`${stars[i + 1].y}%`}
                stroke="rgba(255,255,255,0.3)" // Líneas sutiles
                strokeWidth="1"
              />
            ) : null,
          )}
        </svg>

        {/* Estrellas Interactivas (Los Puntos Blancos) */}
        {stars.map((s, i) => (
          <div
            key={s.id}
            className="absolute z-10 group"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              // El centrado lo manejamos con transform para el centrado perfecto y el pulso
            }}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* AQUÍ ESTÁ LA CORRECCIÓN DE LA ANIMACIÓN DE LATIDO */}
            <div
              // Usamos la animación lenta definida en tailwind.config, o 'animate-pulse'
              className="w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_white] transition-transform group-hover:scale-150 cursor-pointer animate-slow-beat"
              style={{
                // Desfase aleatorio para que no todos latan a la vez
                animationDelay: `${i * 0.1}s`,
              }}
            />

            {/* Tooltip con el mensaje */}
            {hovered === s.id && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-center shadow-xl z-50 animate-in fade-in zoom-in duration-200">
                {/* CORRECCIÓN: Comillas escapadas para ESLint */}
                <p className="italic text-sm">&quot;{s.contenido}&quot;</p>
                <p className="mt-1 text-[10px] uppercase opacity-70">
                  - {s.nombre || "Anónimo"}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Título de la Constelación */}
        <div className="relative pt-16 text-center text-white z-20 pointer-events-none">
          <h2 className="text-5xl font-serif">Experiencia Moonlight</h2>
          <p className="opacity-80 mt-2">Muro de constelaciones ✨</p>
        </div>
      </div>

      {/* 2. SECCIÓN DEL FORMULARIO (Debajo y fuera) */}
      <div className="flex flex-col items-center mt-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-8 rounded-[40px] shadow-lg border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-6 justify-center text-purple-600">
            <span className="text-2xl">✨</span>
            <h3 className="text-3xl font-serif">Deja tu estrella</h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-purple-50 border-none rounded-2xl p-4 text-purple-900 placeholder:text-purple-300 outline-none focus:ring-2 ring-purple-200 transition"
            />

            <div className="relative">
              <textarea
                value={contenido}
                onChange={(e) =>
                  setContenido(e.target.value.slice(0, MAX_CHARS))
                }
                rows={4}
                placeholder="Escribe tu mensaje para el universo..."
                className="w-full bg-purple-50 border-none rounded-3xl p-5 text-purple-900 placeholder:text-purple-300 outline-none focus:ring-2 ring-purple-200 transition resize-none"
              />
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-xs text-purple-300">
                  {contenido.length}/{MAX_CHARS} caracteres
                </span>
                <button
                  type="submit"
                  disabled={enviando || !contenido.trim()}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-full transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="font-medium">
                    {enviando ? "Enviando..." : "Enviar al cielo"}
                  </span>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>

        <p className="text-purple-400 mt-6 text-sm font-light">
          {stars.length} estrellas brillando en nuestro cielo 💜
        </p>
      </div>
    </section>
  );
}
