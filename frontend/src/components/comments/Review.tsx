"use client";

import { useEffect, useState } from "react";
import { getComentarios, createComentario } from "@/services/comments-service";
import { Send } from "lucide-react";

type ComentarioBackend = {
  id: string | number;
  contenido: string;
  userId: string;
  user?: {
    name: string | null;
    email: string;
    image: string | null;
  };
};

type Star = {
  id: string | number;
  contenido: string;
  nombre: string;
  x: number;
  y: number;
};

export default function MoonlightExperience() {
  const [stars, setStars] = useState<Star[]>([]);
  const [hovered, setHovered] = useState<string | number | null>(null);
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);

  // 🌠 Estado para la animación de la estrella fugaz viajera
  const [shootingStar, setShootingStar] = useState<{
    x: number;
    y: number;
    contenido: string;
    nombre: string;
  } | null>(null);

  const MAX_CHARS = 150;

  useEffect(() => {
    fetchComentarios();
  }, []);

  const fetchComentarios = async () => {
    try {
      const data = await getComentarios<ComentarioBackend[]>();

      const positioned: Star[] = (data || []).map((c, i) => ({
        id: c.id,
        contenido: c.contenido,
        nombre: c.user?.name || "Anónimo",
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

      const nuevo = await createComentario<ComentarioBackend>(
        contenido,
        nombre,
      );

      // Calculamos destino final aleatorio
      const targetX = Math.random() * 80 + 10;
      const targetY = Math.random() * 60 + 20;
      const aliasFinal = nombre.trim() || nuevo.user?.name || "Anónimo";

      // 1. Lanzamos la animación de la estrella viajera desde abajo
      setShootingStar({
        x: targetX,
        y: targetY,
        contenido: nuevo.contenido,
        nombre: aliasFinal,
      });

      // Limpiamos formulario de inmediato
      setContenido("");
      setNombre("");

      // 2. Cuando termina el viaje (1.2 segundos), se fija en la constelación y abre su mensaje
      setTimeout(() => {
        const nuevaStar: Star = {
          id: nuevo.id,
          contenido: nuevo.contenido,
          nombre: aliasFinal,
          x: targetX,
          y: targetY,
        };

        setStars((prev) => [...prev, nuevaStar]);
        setShootingStar(null);

        // Forzamos el hover visual para que lea su propio mensaje recién llegado
        setHovered(nuevo.id);

        // Cerramos el cartel automáticamente a los 4 segundos
        setTimeout(() => {
          setHovered(null);
        }, 4000);
      }, 1200);
    } catch (error) {
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="w-full px-4 py-10 bg-[#fdf2f8]">
      {/* 1. SECCIÓN DE CONSTELACIÓN (Degradé Pastel Suave) */}
      <div className="relative w-full h-150 overflow-hidden bg-gradient-to-b from-[#6d5b7b] via-[#b5a1cf] to-[#e8d7f5] rounded-[50px] shadow-2xl">
        {/* Estrellitas de fondo intermitentes */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`bg-${i}`}
            className="absolute bg-white/40 rounded-full animate-pulse"
            style={{
              width: "2px",
              height: "2px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Líneas de la constelación: Parten perfectamente desde el centro geométrico */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {stars.map((s, i) =>
            stars[i + 1] ? (
              <line
                key={`line-${s.id}`}
                x1={`${s.x}%`}
                y1={`${s.y}%`}
                x2={`${stars[i + 1].x}%`}
                y2={`${stars[i + 1].y}%`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 2" // Estilo constelación mágico trazado
              />
            ) : null,
          )}
        </svg>

        {/* Renderizado de Estrellas Reales */}
        {stars.map((s, i) => (
          <div
            key={s.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
            }}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Ícono de Estrella Blanca Centrada */}
            <div
              className="cursor-pointer text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)] transition-transform duration-300 group-hover:scale-150 animate-slow-beat"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>

            {/* Cartel de Mensaje Flotante */}
            {hovered === s.id && (
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-52 p-3.5 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 text-neutral-800 text-center shadow-xl z-50 animate-in fade-in zoom-in duration-200">
                <p className="font-serif italic text-sm text-purple-950">
                  &quot;{s.contenido}&quot;
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase text-purple-800/80 tracking-wider">
                  - {s.nombre}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 🌠 ESTRELLA VIAJERA EN ACCIÓN */}
        {shootingStar && (
          <div
            className="absolute z-50 -translate-x-1/2 -translate-y-1/2 animate-shootUp"
            style={
              {
                "--target-x": `${shootingStar.x}%`,
                "--target-y": `${shootingStar.y}%`,
              } as React.CSSProperties
            }
          >
            <div className="text-white drop-shadow-[0_0_15px_white] scale-125">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            {/* Pequeña estela de luz viajera */}
            <div className="w-1 h-8 bg-gradient-to-t from-transparent to-white/80 mx-auto -mt-1 rounded-full blur-[1px]" />
          </div>
        )}

        {/* Título Principal */}
        <div className="relative pt-16 text-center text-white z-20 pointer-events-none select-none">
          <h2 className="text-5xl font-serif tracking-wide drop-shadow-sm">
            Experiencia Moonlight
          </h2>
          <p className="opacity-90 font-light tracking-widest text-xs uppercase mt-2">
            Muro de constelaciones ✨
          </p>
        </div>
      </div>

      {/* 2. SECCIÓN DEL FORMULARIO */}
      <div className="flex flex-col items-center mt-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-8 rounded-[40px] shadow-lg border border-purple-100"
        >
          <div className="flex items-center gap-2 mb-6 justify-center text-purple-500">
            <span className="text-2xl">✨</span>
            <h3 className="text-3xl font-serif">Deja tu estrella</h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="¿Cómo querés que figure tu estrella? (opcional)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-purple-50/60 border-none rounded-2xl p-4 text-purple-900 placeholder:text-purple-300 outline-none focus:ring-2 ring-purple-200 transition"
            />

            <div className="relative">
              <textarea
                value={contenido}
                onChange={(e) =>
                  setContenido(e.target.value.slice(0, MAX_CHARS))
                }
                rows={4}
                placeholder="Escribe tu mensaje para el universo..."
                className="w-full bg-purple-50/60 border-none rounded-3xl p-5 text-purple-900 placeholder:text-purple-300 outline-none focus:ring-2 ring-purple-200 transition resize-none"
              />
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-xs text-purple-300">
                  {contenido.length}/{MAX_CHARS} caracteres
                </span>
                <button
                  type="submit"
                  disabled={enviando || !contenido.trim()}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-50 font-medium text-sm shadow-md"
                >
                  <span>{enviando ? "Enviando..." : "Enviar al cielo"}</span>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </form>

        <p className="text-purple-400/80 mt-6 text-sm font-light tracking-wide">
          {stars.length} estrellas brillando en nuestro cielo 💜
        </p>
      </div>

      {/* 🛠️ KEYFRAMES PARA LA ANIMACIÓN DEL VIAJE DE LA ESTRELLA */}
      <style jsx global>{`
        @keyframes shootUp {
          0% {
            left: 50%;
            top: 110%;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            left: var(--target-x);
            top: var(--target-y);
            transform: translate(-50%, -50%) scale(1.3) rotate(360deg);
            opacity: 1;
          }
        }
        .animate-shootUp {
          animation: shootUp 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </section>
  );
}
