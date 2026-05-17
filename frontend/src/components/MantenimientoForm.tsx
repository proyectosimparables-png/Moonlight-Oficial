// src/components/MantenimientoForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mensaje: string;
}

export function MantenimientoForm({ mensaje }: Props) {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) return;

    setCargando(true);
    // Guardamos el código en la cookie
    document.cookie = `moonlight_vip_access=${codigo}; path=/; max-age=86400; SameSite=Lax`;

    // Forzamos el refresh para que el middleware vuelva a evaluar con la nueva cookie
    router.push("/");
    setTimeout(() => {
      router.refresh();
      setCargando(false);
    }, 500);
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl p-8 rounded-3xl border border-zinc-800/50 w-full max-w-md shadow-2xl">
      <h2 className="text-xl font-light mb-4 text-center text-zinc-100">
        Tienda en preparación
      </h2>

      <p className="text-zinc-400 text-center mb-8 text-sm leading-relaxed font-light">
        {mensaje}
      </p>

      <form onSubmit={handleAccess} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-1 font-semibold">
            Acceso VIP
          </label>
          <input
            type="password"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ingresá tu código"
            className="w-full bg-black/20 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-500/50 transition-all text-center tracking-[0.5em] text-lg"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-zinc-100 text-black font-bold py-4 rounded-2xl hover:bg-yellow-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
        >
          {cargando ? "VALIDANDO..." : "INGRESAR"}
        </button>
      </form>
    </div>
  );
}
