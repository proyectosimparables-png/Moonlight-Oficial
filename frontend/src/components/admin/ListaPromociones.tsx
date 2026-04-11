"use client";

import { useEffect, useState } from "react";
import { Tag, Trash2, Gift, AlertCircle } from "lucide-react";
import {
  deletePromocion,
  getPromociones,
  Promocion,
} from "@/services/promoService";

export const ListaPromociones = () => {
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Usamos el servicio para cargar los datos
  useEffect(() => {
    getPromociones()
      .then((data) => {
        setPromos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar promos:", err);
        setLoading(false);
      });
  }, []);

  // 2. Usamos el servicio para eliminar
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás segura de que querés eliminar esta promoción?"))
      return;

    try {
      const success = await deletePromocion(id);
      if (success) {
        // Actualización optimista de la UI
        setPromos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar la promoción.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
        <p className="text-purple-600 font-medium">Cargando promociones...</p>
      </div>
    );

  if (promos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
        <Tag className="text-gray-300 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-700">
          Aún no cuentas con promociones activas
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Hacé clic en el botón superior para crear una.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promos.map((promo) => (
        <div
          key={promo.id}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all group relative"
        >
          {/* Botón de Eliminar */}
          <button
            onClick={() => handleDelete(promo.id)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar promoción"
          >
            <Trash2 size={18} />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              {promo.tipo.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600 mt-1">
              <Gift size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 leading-tight">
                {promo.nombre}
              </h3>
              <p className="text-purple-600 font-black text-xl mt-1">
                {promo.tipo === "2X1" || promo.tipo === "3X2"
                  ? promo.tipo
                  : `${promo.valor}% OFF`}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
            <AlertCircle size={14} />
            <span>
              Aplicada a{" "}
              {/* Si tu interfaz Promocion tiene productosIds, podemos mostrar el conteo */}
              <span className="font-bold">
                {promo.productosIds?.length || 0}
              </span>{" "}
              productos
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
