"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Ticket, Plus, Tag, Trash2, Edit3, Loader2 } from "lucide-react";
import FormCupon from "@/components/admin/FormCupon";

export interface Cupon {
  id: string;
  codigo: string;
  tipo: "PORCENTAJE" | "MONTO_FIJO" | "ENVIO_GRATIS";
  valor: number;
  usados: number;
  limiteUso?: number;
  minimoCarrito: number;
  activo: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  acumulable: boolean;
  soloPrimeraCompra: boolean;
}

export default function ListaCupones() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cuponAEditar, setCuponAEditar] = useState<Cupon | null>(null);

  // Usamos la misma variable que ya sabes que funciona
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCupones = useCallback(async () => {
    setCargando(true);
    try {
      // Aplicamos el mismo patrón: URL absoluta + credentials
      const res = await fetch(`${API_URL}/promociones/cupon`, {
        method: "GET",
        credentials: "include", // Importante si manejas sesiones
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(
          `Error ${res.status}: No se encontró la ruta en el backend`,
        );
      }

      const data = await res.json();

      // Saneamos la data por si viene envuelta en un objeto (común en NestJS)
      const listaFinal = Array.isArray(data) ? data : data.data || [];
      setCupones(listaFinal);
    } catch (error) {
      console.error("Error cargando cupones:", error);
    } finally {
      setCargando(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchCupones();
  }, [fetchCupones]);

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás segura de eliminar este cupón?")) return;
    try {
      const res = await fetch(`${API_URL}/promocion/cupon/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCupones((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEditar = (cupon: Cupon) => {
    setCuponAEditar(cupon);
    setMostrarFormulario(true);
  };

  // Lógica de renderizado (Formulario o Lista)
  if (mostrarFormulario) {
    return (
      <div className="relative animate-in fade-in duration-300">
        <button
          onClick={() => {
            setMostrarFormulario(false);
            setCuponAEditar(null);
          }}
          className="absolute top-6 left-6 z-10 text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2"
        >
          ← Volver a la lista
        </button>
        <FormCupon
          cuponData={cuponAEditar ?? undefined}
          onSuccess={() => {
            setMostrarFormulario(false);
            setCuponAEditar(null);
            fetchCupones();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">
            Panel de Cupones
          </h1>
          <p className="text-gray-500">Gestioná los códigos de descuento</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" /> Crear Cupón
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 text-purple-300 animate-spin" />
        </div>
      ) : cupones.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cupones.map((cupon) => (
            <div
              key={cupon.id}
              className="bg-white border border-purple-100 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:border-purple-300 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${cupon.activo ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 font-mono uppercase tracking-wider">
                    {cupon.codigo}
                  </h3>
                  <p className="text-sm text-purple-600 font-medium">
                    {cupon.tipo === "PORCENTAJE"
                      ? `${cupon.valor}%`
                      : `$${cupon.valor}`}{" "}
                    de descuento
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block mr-4">
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Usos
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {cupon.usados || 0} / {cupon.limiteUso || "∞"}
                  </p>
                </div>
                <button
                  onClick={() => handleEditar(cupon)}
                  className="text-blue-400 hover:text-blue-600 p-2 rounded-lg transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEliminar(cupon.id)}
                  className="text-red-400 hover:text-red-600 p-2 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-purple-100 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <Ticket className="w-12 h-12 text-purple-100 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">
            No se encontraron cupones
          </h2>
          <p className="text-gray-400">
            Asegúrate de que la ruta <b>/promocion/cupon</b> exista en tu
            controlador de NestJS.
          </p>
        </div>
      )}
    </div>
  );
}
