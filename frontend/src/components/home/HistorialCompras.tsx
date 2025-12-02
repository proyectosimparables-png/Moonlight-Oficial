"use client";

import { useEffect, useState } from "react";
import { getUserHistorial } from "@/services/historialService";
import Image from "next/image";

export default function HistorialCompras() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await getUserHistorial();
        setHistorial(data.historial);
        setTotal(data.total);
        setCantidad(data.cantidad);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-color-dark">
        Cargando historial de compras...
      </div>
    );
  }

  if (historial.length === 0) {
   return (
  <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-600 space-y-4">
    {/* Icono de carrito vacío */}
    <div className="w-24 h-24 bg-transparent flex justify-center items-center animate-bounce">
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
        <h2 className="text-3xl font-semibold mb-6 text-center">Mi Historial de Compras</h2>

        <div className="mb-6 flex justify-between font-semibold text-color-dark">
          <span>Cantidad de productos: {cantidad}</span>
          <span>Total: ${total.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          {historial.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white rounded-lg p-4 shadow hover:shadow-lg transition-all duration-300"
            >
              {item.imagenUrl && (
                <Image
                  src={item.imagenUrl}
                  alt={item.nombre}
                  width={64}
                  height={64}
                  className="rounded-md mr-4 object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-sm text-gray-600">
                  ${item.precio?.toFixed(2)} - {new Date(item.fecha).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
