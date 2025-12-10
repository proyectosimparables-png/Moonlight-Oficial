"use client";

import { useEffect, useState } from "react";
import { createComentario } from "@/services/comentarios";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ComentarSection() {
  const [contenido, setContenido] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { isAuthenticated } = useAuth();
const router = useRouter();


  useEffect(()=>{
  if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para poder comentar", {
        position: "top-center",
      });
     setTimeout(() => {
        router.push("/login");
         }, 3000);

  
      return;
    }
  },[isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return setMensaje("Por favor escribe un comentario.");

    try {
      setEnviando(true);
      await createComentario(contenido);
      setContenido("");
      setMensaje("✅ ¡Gracias por compartir tu experiencia!");
    } catch {
      setMensaje("❌ Error al enviar el comentario.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section
      className="max-w-2xl mx-auto mt-10 p-6 rounded-xl shadow-md"
      style={{ backgroundColor: "var(--color-soft-beige)" }}
    >
      <h2
        className="text-center text-2xl font-bold mb-4"
        style={{ color: "var(--color-dark)" }}
      >
        Cuéntanos tu experiencia 💬
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={4}
          placeholder="Escribe aquí tu experiencia..."
          className="p-3 rounded-md border focus:outline-none focus:ring-2 resize-none"
          style={{
            backgroundColor: "var(--color-hover)",
            borderColor: "var(--color-lilac)",
            color: "var(--color-dark)",
          }}
        />

        <button
          type="submit"
          disabled={enviando}
          className="font-medium py-2 px-4 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: "var(--color-lilac)",
            color: "white",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-dark)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-lilac)")
          }
        >
          {enviando ? "Enviando..." : "Enviar comentario"}
        </button>
      </form>

      {mensaje && (
        <p
          className="text-center font-medium mt-4"
          style={{ color: "var(--color-dark)" }}
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
