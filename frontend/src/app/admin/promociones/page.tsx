// src/app/admin/promociones/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { ListaPromociones } from "@/components/admin/ListaPromociones";

export default function PromocionesPage() {
  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Panel de Promociones
          </h1>
          <p className="text-gray-500 text-sm">
            Gestioná los descuentos de Moonlight
          </p>
        </div>

        <Link
          href="/admin/promociones/formulario"
          className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
        >
          <Plus size={18} />
          Crear Promoción
        </Link>
      </div>

      <ListaPromociones />
    </main>
  );
}
