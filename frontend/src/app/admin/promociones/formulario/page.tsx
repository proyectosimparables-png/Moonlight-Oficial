// src/app/admin/promociones/nueva/page.tsx
import { FormPromocion } from "@/components/admin/FormPromocion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevaPromocionPage() {
  return (
    <main className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/promociones"
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6"
        >
          <ArrowLeft size={18} /> Volver al listado
        </Link>

        <FormPromocion />
      </div>
    </main>
  );
}
