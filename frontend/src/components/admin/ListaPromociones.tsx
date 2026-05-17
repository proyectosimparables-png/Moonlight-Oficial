"use client";

import { useEffect, useState, useCallback } from "react";
import { Tag, Trash2, Gift, AlertCircle } from "lucide-react";

import { PromocionResponse as Promocion } from "@/types/promociones";
import { promocionesService } from "@/services/admin/admin-promociones-service";

export const ListaPromociones = () => {
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);

  // Centralizado con useCallback para un manejo limpio del ciclo de vida
  const fetchPromociones = useCallback(async () => {
    setLoading(true);
    const data = await promocionesService.getPromociones();
    setPromos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPromociones();
  }, [fetchPromociones]);

  // Manejo de eliminación utilizando el servicio e inyección reactiva local
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás segura de que querés eliminar esta promoción?"))
      return;

    try {
      await promocionesService.deletePromocion(id);
      // Actualización optimista de la UI
      setPromos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(
        "Error al eliminar la promoción mediante el servicio:",
        error,
      );
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
              {promo.tipo ? promo.tipo.replace(/_/g, " ") : "PROMOCIÓN"}
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
                {promo.tipo === "COMPRA_X_LLEVA_Y"
                  ? "Beneficio XxY"
                  : `${promo.valor}% OFF`}
              </p>
            </div>
          </div>

          {/* Saneamiento de contadores mapeando la estructura real de Prisma (include) */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-1 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span>
                Aplicada a{" "}
                <span className="font-bold text-gray-700">
                  {promo.productos?.length || 0}
                </span>{" "}
                productos
              </span>
            </div>
            {(promo.categorias?.length ?? 0) > 0 && (
              <p className="pl-5 text-[11px]">
                Categorías vinculadas:{" "}
                <span className="font-semibold text-purple-600">
                  {promo.categorias?.map((c) => c.nombre).join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
