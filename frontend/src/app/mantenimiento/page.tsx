// src/app/mantenimiento/page.tsx
import { MantenimientoForm } from "@/components/MantenimientoForm";
import { Suspense } from "react";

export default async function MantenimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { msg } = await searchParams;
  const mensajeDefault = "Estamos renovando nuestra magia para vos.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 tracking-tighter text-white">
          🌙 Moonlight
        </h1>
        <div className="w-16 h-[1px] bg-yellow-500/50 mx-auto"></div>
      </div>

      <Suspense fallback={<div className="text-zinc-500">Cargando...</div>}>
        <MantenimientoForm mensaje={msg || mensajeDefault} />
      </Suspense>

      <p className="mt-12 text-zinc-600 text-[10px] tracking-[0.3em] uppercase font-medium">
        Estampas con alma
      </p>
    </main>
  );
}
