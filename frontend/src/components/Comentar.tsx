"use client";

import { useEffect, useState } from "react";
import { useNightMode } from "@/context/NightModeContext";
import { createComentario } from "@/services/comentarios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ComentarSection() {
  const [contenido, setContenido] = useState("");
  const [explosion, setExplosion] = useState(false);
  const { isNight } = useNightMode();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();


  const textColor = isNight ? "#f3e9ff" : "#4a3b5a";
  const glassBg = isNight ? "rgba(45, 30, 70, 0.4)" : "rgba(255, 255, 255, 0.3)";


  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para poder comentar", { position: "top-center" });
      setTimeout(() => router.push("/login"), 3000);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return setMensaje("Por favor escribe un comentario.");
     setExplosion(true);
    setTimeout(() => setExplosion(false), 600);
    try {
      setEnviando(true);
      await createComentario(contenido);
      setContenido("");
      setMensaje(" 🌙¡Gracias por compartir tu experiencia!");
    } catch {
      setMensaje("❌ Error al enviar el comentario.");
    } finally {
      setEnviando(false);
    }
  };

  return (
   <section className="relative w-full mt-32 py-20 flex flex-col items-center">
      
      {/* --- COMENTARIOS FLOTANTES (DETRÁS Y MEDIANOS) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-float-medium flex flex-col items-center"
            style={{
              "--tw-translate-x": `${(Math.random() - 0.5) * 500}px`,
              animationDelay: `${i * 1.5}s`,
              color: isNight ? "#d8b4fe" : "#7b5ca2",
            } as any}
          >
            {/* Icono mediano */}
            <span className="text-3xl mb-1 ">
              {["✨", "❤️", "🌙", "⭐", "💖"][i % 5]}
            </span>
            {/* Texto mediano con estilo sutil */}
            <span className="text-sm font-serif italic bg-white/5  px-3 py-0.5 rounded-full border border-white/10">
              {["Increíble", "Mágico", "Lo amé", "Divino", "Hermoso"][i % 5]}
            </span>
          </div>
        ))}
      </div>

      {/* --- FORMULARIO COMPACTO (z-index alto para estar al frente) --- */}
      <div
        className="relative z-10 w-full max-w-sm p-8 rounded-[2.5rem] shadow-xl backdrop-blur-xl border border-white/30 transition-all duration-500"
        style={{ backgroundColor: glassBg, color: textColor }}
      >
        <h2 className="text-center text-2xl font-serif italic mb-6">
          Tu experiencia 💬
        </h2>

        <div className="relative flex flex-col gap-4">
          {/* EXPLOSIÓN PEQUEÑA */}
          {explosion && [...Array(10)].map((_, i) => (
            <span 
              key={i} 
              className="star-particle-small"
              style={{
                "--ex": `${Math.cos(i) * 120}px`,
                "--ey": `${Math.sin(i) * 120}px`,
              } as any}
            >
              ⭐
            </span>
          ))}

          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={3}
            placeholder="Escribe algo mágico..."
            className="p-4 rounded-2xl border-none focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm shadow-inner"
            style={{
              backgroundColor: isNight ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
              color: textColor
            }}
          />

         <button
            onClick={handleSubmit}
            type="submit"
            disabled={enviando}
            className="font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            style={{
              backgroundColor: "var(--color-lilac)",
              color: "white",
            }}
          >
            {enviando ? "Enviando magia..." : "Enviar comentario ⭐"}
          </button>
     

        {mensaje && (
          <p className="text-center font-medium mt-6 animate-pulse">
            {mensaje}
          </p>
        )}
        </div>
      </div>
    </section>
  );
}