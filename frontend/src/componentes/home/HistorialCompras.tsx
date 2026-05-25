"use client";

import { useEffect, useState } from "react";
import { getUserHistorial } from "@/services/historial-service";
import { HistorialResponse, HistorialOrden } from "@/types/ordenes";
import Image from "next/image";

// 🔹 Configuración de colores y etiquetas por estado
const ESTADOS_CONFIG: Record<string, { label: string; color: string }> = {
  PAGADO: {
    label: "Pagado",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  ENTREGADO: {
    label: "Entregado",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  PENDIENTE: {
    label: "Pendiente de Pago",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  ENVIADO: {
    label: "En Camino",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  EMPAQUETADO: {
    label: "En Preparación",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  REEMBOLSADO: {
    label: "Reembolsado",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  CARRITO: {
    label: "En Carrito",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export default function HistorialCompras() {
  const [historial, setHistorial] = useState<HistorialOrden[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [cantidad, setCantidad] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await getUserHistorial<HistorialResponse>();

        if (data) {
          setHistorial(data.historial || []);
          setTotal(data.total || 0);
          setCantidad(data.cantidad || 0);
        }
      } catch (err) {
        console.error("Error al cargar el historial:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-color-dark italic">
        Cargando tus compras...
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-600 space-y-4">
        <div className="w-24 h-24 flex justify-center items-center animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6H19M7 13l-2-6M16 21a2 2 0 100-4 2 2 0 000 4zm-8 0a2 2 0 100-4 2 2 0 000 4z"
            />
          </svg>
        </div>
        <p className="text-xl font-semibold animate-pulse">
          No tienes compras aún
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 bg-soft-beige">
      <div className="w-full max-w-3xl bg-pastel-lilac p-6 rounded-2xl shadow-xl animate-fadeIn border-2 border-lilac">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Mi Historial de Compras
        </h2>

        <div className="mb-6 flex justify-between font-semibold text-color-dark bg-white/50 p-4 rounded-lg border border-lilac/30 shadow-sm">
          <span>Pedidos: {cantidad}</span>
          <span>
            Inversión Total: $
            {total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="space-y-6">
          {historial.map((orden) => {
            const config = ESTADOS_CONFIG[orden.estado] || {
              label: orden.estado,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <div
                key={orden.id}
                className="bg-white rounded-lg p-5 shadow-sm border-l-8 border-lilac hover:shadow-md transition-all duration-300"
              >
                {/* Cabecera de la Orden */}
                <div className="flex justify-between border-b pb-3 mb-4 items-center">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-tighter">
                      Referencia
                    </span>
                    <span className="text-sm font-mono font-medium text-gray-700">
                      #{orden.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-tighter">
                      Fecha de Compra
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(orden.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Items de la Orden */}
                <div className="space-y-4">
                  {orden.items?.map((producto) => (
                    <div key={producto.id} className="flex items-center group">
                      {producto.imagenUrl && (
                        <div className="relative w-14 h-14 mr-4 shrink-0">
                          <Image
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            fill
                            className="rounded-md object-cover border border-gray-100 shadow-sm"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm group-hover:text-lilac transition-colors italic">
                          {producto.nombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          {producto.cantidad} x $
                          {Number(producto.precio).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer de la Orden */}
                <div className="mt-5 pt-4 border-t flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">
                      Estado del Pedido
                    </span>
                    <span
                      className={`text-[11px] px-3 py-1 rounded-full font-bold border ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      Monto Final
                    </span>
                    <span className="text-xl font-black text-lilac-dark">
                      $
                      {Number(orden.total).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
