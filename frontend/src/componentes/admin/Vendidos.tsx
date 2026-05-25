"use client";

import { Printer, Package, ChevronLeft } from "lucide-react";
import { Button } from "@/componentes/ui/button";
import { Badge } from "@/componentes/ui/badge";
import Link from "next/link";

interface Props {
  ordenId: string;
  estado: string;
  fecha: Date;
}

export default function OrderHeader({ ordenId, estado, fecha }: Props) {
  const displayId = ordenId.split("-")[0].toUpperCase();

  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "numeric", // Cambiado a numeric para ahorrar espacio (ej: 18/4/2026)
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(fecha));

  return (
    <div className="space-y-4 mb-6">
      {" "}
      {/* Espaciado reducido de 6/8 a 4/6 */}
      {/* Fila Superior: Navegación y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/ventas"
            className="p-1 hover:bg-gray-100 rounded-full bg-white border border-gray-200 transition-colors shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {" "}
            {/* Reducido de 4xl a 2xl */}#{displayId}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm mr-1"></div>

          {/* Botones con altura h-9 para mayor densidad visual */}

          <Button
            className="bg-[#0061E0] hover:bg-[#0051bc] text-white font-bold h-9 px-4 text-sm shadow-sm"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5 mr-2" /> Imprimir
          </Button>
        </div>
      </div>
      {/* Badges de Estado más compactos */}
      <div className="flex items-center gap-2">
        <Badge className="bg-[#E6F9F4] text-[#00A376] border-none px-2 py-0.5 text-[11px] font-bold shadow-sm">
          $ Recibido
        </Badge>
        <Badge
          variant="outline"
          className="text-gray-500 font-normal px-2 py-0.5 flex items-center gap-1 bg-white shadow-sm border-gray-200 rounded-full text-[11px]"
        >
          <Package className="h-3 w-3 text-gray-400" />
          {estado === "EMPAQUETADO" ? "Empaquetado" : "Por empaquetar"}
        </Badge>
      </div>
      {/* Detalle y Fecha - Reducción de tamaños y paddings */}
      <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            {" "}
            {/* Reducido de 3xl a xl */}
            Detalle de la venta
          </h2>
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              📅 {fechaFormateada}
            </span>
          </div>
        </div>
        <button className="text-[#0061E0] font-bold text-lg hover:underline">
          {" "}
          {/* Reducido de 2xl a lg */}
          Más información
        </button>
      </div>
    </div>
  );
}
