"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Gift,
  MousePointerClick,
  Layers,
  Loader2,
  X,
  Check,
  ChevronRight,
  Square,
  CheckSquare,
  Calendar,
} from "lucide-react";

import {
  getSecciones,
  getCategoriasTree,
  getProductosAdmin as getProductos,
} from "@/services/productos-service";
import { CategoriaTreeSelector } from "../products/CategoriaTreeSelector";
import { promocionesService } from "@/services/admin/admin-promociones-service";

// Interfaz local simple para evitar el uso de 'any' exigido por ESLint
interface CategoriaNode {
  id: string;
  nombre: string;
  children?: CategoriaNode[];
  [key: string]: unknown;
}

export const FormPromocion = () => {
  const router = useRouter();

  /* --- ESTADOS DE DATOS --- */
  // 🔢 Mantenemos el ID como number porque getProductos() los trae así de la DB
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  const [secciones, setSecciones] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  // ✅ Solución al ESLint no-explicit-any usando la interfaz limpia
  const [categoriasData, setCategoriasData] = useState<CategoriaNode[]>([]);

  /* --- ESTADOS DE SELECCIÓN --- */
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    string[]
  >([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    number[]
  >([]);

  /* --- ESTADOS DE UI --- */
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tab, setTab] = useState<"productos" | "categorias">("productos");
  const [loading, setLoading] = useState(false);
  const [seccionActivaTree, setSeccionActivaTree] = useState<string | null>(
    null,
  );

  /* --- FORM DATA --- */
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "PORCENTAJE",
    valor: 0,
    lleva: 2,
    paga: 1,
    acumulable: false,
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
    getProductos().then(setProductos).catch(console.error);
  }, []);

  // Carga el árbol de categorías dinámicamente según la sección activa
  useEffect(() => {
    if (!seccionActivaTree) {
      setCategoriasData([]);
      return;
    }
    getCategoriasTree(seccionActivaTree)
      .then((data) => {
        if (data) setCategoriasData(data as CategoriaNode[]);
      })
      .catch(console.error);
  }, [seccionActivaTree]);

  const openSelector = (mode: "productos" | "categorias") => {
    setTab(mode);
    setIsPanelOpen(true);
  };

  const handleSelectAll = () => {
    if (productosSeleccionados.length === productos.length) {
      setProductosSeleccionados([]);
    } else {
      setProductosSeleccionados(productos.map((p) => p.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Separamos acumulable para que no se envíe duplicado o con nombre incorrecto
      const { acumulable, ...restFormData } = formData;

      const payload = {
        ...restFormData,
        prioridad: 1,
        esCombinable: acumulable,
        activa: true,
        // ✨ SOLUCIÓN AL ERROR 2345: Convertimos los numbers a strings antes de mandar el payload
        productosIds: productosSeleccionados.map((id) => String(id)),
        categoriasIds: categoriasSeleccionadas,
        seccionesIds: seccionesSeleccionadas,
        fechaInicio: formData.fechaInicio
          ? new Date(formData.fechaInicio).toISOString()
          : null,
        fechaFin: formData.fechaFin
          ? new Date(formData.fechaFin).toISOString()
          : null,
      };

      await promocionesService.createPromocion(payload);
      toast.success("Promoción creada con éxito");
      router.push("/admin/promociones");
    } catch (error) {
      console.error("Error al crear la promoción:", error);
      toast.error("Error al crear la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl space-y-6 border border-gray-100"
      >
        <div className="flex items-center gap-2 border-b pb-4">
          <Gift className="text-purple-600" size={24} />
          <h2 className="text-xl font-bold text-purple-900">Nueva Promoción</h2>
        </div>

        {/* 1. DATOS BÁSICOS */}
        <section className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Nombre de la Promo
            </label>
            <input
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Promo BTS"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Tipo de Descuento
            </label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
              className="border rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="PORCENTAJE">Porcentaje (%)</option>
              <option value="CANTIDAD_X_CANTIDAD">X x Y (2x1, 3x2)</option>
              <option value="SEGUNDA_UNIDAD">Dcto 2da Unidad</option>
            </select>
          </div>
        </section>

        {/* 2. FECHAS */}
        <section className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Calendar size={14} /> FECHA INICIO
            </label>
            <input
              type="date"
              value={formData.fechaInicio}
              onChange={(e) =>
                setFormData({ ...formData, fechaInicio: e.target.value })
              }
              className="border rounded-lg p-2 bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
              <Calendar size={14} /> FECHA FIN
            </label>
            <input
              type="date"
              value={formData.fechaFin}
              onChange={(e) =>
                setFormData({ ...formData, fechaFin: e.target.value })
              }
              className="border rounded-lg p-2 bg-white"
            />
          </div>
        </section>

        {/* 3. SELECTORES A PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => openSelector("productos")}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-500 transition-all"
          >
            <div className="flex items-center gap-3 text-left">
              <MousePointerClick className="text-purple-600" />
              <div>
                <p className="text-sm font-bold">Asignar Productos</p>
                <p className="text-xs text-gray-400">
                  {productosSeleccionados.length} seleccionados
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button
            type="button"
            onClick={() => openSelector("categorias")}
            className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-500 transition-all"
          >
            <div className="flex items-center gap-3 text-left">
              <Layers className="text-blue-600" />
              <div>
                <p className="text-sm font-bold">Categorías/Secciones</p>
                <p className="text-xs text-gray-400">
                  {categoriasSeleccionadas.length} seleccionadas
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>

        {/* 4. CONFIGURACIÓN TÉCNICA DINÁMICA */}
        <section className="bg-purple-50 p-4 rounded-2xl border border-purple-100 space-y-4">
          {formData.tipo === "PORCENTAJE" && (
            <div>
              <label className="text-sm font-bold text-purple-900">
                Valor del Descuento (%)
              </label>
              <input
                type="number"
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: Number(e.target.value) })
                }
                className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>
          )}

          {formData.tipo === "CANTIDAD_X_CANTIDAD" && (
            <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-purple-100">
              <div>
                <label className="text-xs font-bold text-gray-500 block">
                  LLEVA (CANTIDAD)
                </label>
                <input
                  type="number"
                  value={formData.lleva}
                  onChange={(e) =>
                    setFormData({ ...formData, lleva: Number(e.target.value) })
                  }
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block">
                  PAGA (CANTIDAD)
                </label>
                <input
                  type="number"
                  value={formData.paga}
                  onChange={(e) =>
                    setFormData({ ...formData, paga: Number(e.target.value) })
                  }
                  className="w-full mt-1 border rounded-lg p-2"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-100">
            <input
              type="checkbox"
              id="acum"
              checked={formData.acumulable}
              onChange={(e) =>
                setFormData({ ...formData, acumulable: e.target.checked })
              }
              className="w-5 h-5 accent-purple-600 rounded"
            />
            <label htmlFor="acum" className="text-sm text-gray-700">
              Permitir combinar diferentes productos elegidos
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-white bg-purple-700 hover:bg-purple-800 shadow-xl transition-all active:scale-[0.98] disabled:bg-gray-300"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "ACTIVAR PROMOCIÓN 🚀"
          )}
        </button>
      </form>

      {/* --- PANEL LATERAL --- */}
      {isPanelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-tight">
                {tab === "productos"
                  ? "Seleccionar Productos"
                  : "Seleccionar Categorías"}
              </h3>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {tab === "productos" ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-white border px-4 py-2 rounded-lg shadow-sm"
                  >
                    {productosSeleccionados.length === productos.length ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                    {productosSeleccionados.length === productos.length
                      ? "Deseleccionar Todos"
                      : "Seleccionar Todos"}
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {productos.map((p) => (
                      <label
                        key={p.id}
                        className={`px-3 py-2 rounded-xl border text-[11px] font-medium cursor-pointer transition-all ${productosSeleccionados.includes(p.id) ? "bg-purple-600 text-white border-purple-700 shadow-md" : "bg-white text-gray-600 border-gray-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={productosSeleccionados.includes(p.id)}
                          onChange={() =>
                            setProductosSeleccionados((prev) =>
                              prev.includes(p.id)
                                ? prev.filter((i) => i !== p.id)
                                : [...prev, p.id],
                            )
                          }
                        />
                        {p.nombre}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3">
                      1. Secciones Disponibles
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {secciones.map((s) => (
                        <div
                          key={s.id}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${seccionesSeleccionadas.includes(s.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                          onClick={() => {
                            if (!seccionesSeleccionadas.includes(s.id)) {
                              setSeccionesSeleccionadas([
                                ...seccionesSeleccionadas,
                                s.id,
                              ]);
                            }
                            setSeccionActivaTree(s.id);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              className={`text-xs font-bold ${seccionesSeleccionadas.includes(s.id) ? "text-blue-700" : "text-gray-600"}`}
                            >
                              {s.nombre}
                            </span>
                            {seccionesSeleccionadas.includes(s.id) && (
                              <Check size={14} className="text-blue-600" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSeccionesSeleccionadas((prev) =>
                                prev.filter((id) => id !== s.id),
                              );
                              if (seccionActivaTree === s.id)
                                setSeccionActivaTree(null);
                            }}
                            className="text-[9px] text-red-500 font-bold hover:underline text-left"
                          >
                            [ Quitar sección ]
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3">
                      2. Categorías{" "}
                      {seccionActivaTree
                        ? `de: ${secciones.find((s) => s.id === seccionActivaTree)?.nombre}`
                        : ""}
                    </p>
                    {seccionActivaTree ? (
                      <div className="bg-white border rounded-2xl p-4 shadow-inner min-h-50">
                        <CategoriaTreeSelector
                          categorias={categoriasData}
                          value={categoriasSeleccionadas}
                          onChange={setCategoriasSeleccionadas}
                        />
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-2xl text-gray-400 text-xs text-center p-4">
                        Toca una sección arriba para ver y marcar sus categorías
                        específicas.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-white">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={20} /> GUARDAR SELECCIÓN
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
