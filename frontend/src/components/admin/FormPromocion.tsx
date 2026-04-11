"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Gift,
  MousePointerClick,
  Layers,
  Calendar,
  Info,
  Loader2,
} from "lucide-react";
import { createPromocion } from "@/services/promoService";
import {
  getSecciones,
  getCategoriasTree,
  getProductos,
} from "@/services/productos";
import { CategoriaTreeSelector } from "../CategoriaTreeSelector";

export const FormPromocion = () => {
  const router = useRouter();

  /* --- ESTADOS DE DATOS --- */
  const [productos, setProductos] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  const [secciones, setSecciones] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  const [categoriasData, setCategoriasData] = useState([]);

  /* --- ESTADOS DE SELECCIÓN (Igual que Producto) --- */
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    string[]
  >([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    string[]
  >([]);

  const [tab, setTab] = useState<"productos" | "categorias">("productos");
  const [loading, setLoading] = useState(false);

  /* --- FORM DATA --- */
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "PORCENTAJE",
    valor: 0,
    lleva: 2,
    paga: 1,
    prioridad: 0,
    acumulable: false,
    fechaInicio: "",
    fechaFin: "",
  });

  /* --- CARGA INICIAL --- */
  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
    getProductos().then(setProductos).catch(console.error);
  }, []);

  /* --- CARGA DE ÁRBOL (Replicado de FormProducto) --- */
  useEffect(() => {
    // Si no hay sección elegida o el ID es muy corto (evitar ruidos), limpiamos
    if (!seccionesSeleccionadas[0] || seccionesSeleccionadas[0].length < 10) {
      setCategoriasData([]);
      return;
    }
    // Cargamos el árbol de la sección seleccionada (usamos la primera como base)
    getCategoriasTree(seccionesSeleccionadas[0])
      .then((data) => {
        if (data) setCategoriasData(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar las categorías");
      });
  }, [seccionesSeleccionadas]);

  const toggleSeccion = (id: string) => {
    // Para promociones, podrías permitir varias secciones,
    // pero para mantener la lógica del TreeSelector, manejamos la principal
    setSeccionesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        esCombinable: formData.acumulable,
        activa: true,
        // Los IDs que vienen de los selectores
        productosIds: productosSeleccionados,
        categoriasIds: categoriasSeleccionadas,
        seccionesIds: seccionesSeleccionadas,
        // Formateo de fechas para el backend
        fechaInicio: formData.fechaInicio
          ? new Date(formData.fechaInicio).toISOString()
          : undefined,
        fechaFin: formData.fechaFin
          ? new Date(formData.fechaFin).toISOString()
          : undefined,
      };

      await createPromocion(payload);
      toast.success("Promoción creada correctamente");
      router.push("/admin/promociones");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la promoción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white/70 backdrop-blur p-6 rounded-2xl shadow-xl space-y-6"
    >
      <div className="flex items-center gap-2 border-b pb-4">
        <Gift className="text-purple-600" size={24} />
        <h2 className="text-xl font-bold text-purple-900">
          Configurar Nueva Promoción
        </h2>
      </div>

      {/* DATOS BÁSICOS */}
      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nombre de la Promo</label>
          <input
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Ej: Hot Sale Verano"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo de Promo</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
          >
            <option value="PORCENTAJE">Porcentaje de Descuento</option>
            <option value="CANTIDAD_X_CANTIDAD">X x Y (Ej: 2x1, 3x2)</option>
            <option value="SEGUNDA_UNIDAD">Descuento en 2da Unidad</option>
          </select>
        </div>
      </section>

      {/* SELECCIÓN DE OBJETIVOS (TABS) */}
      <div className="space-y-3">
        <div className="flex gap-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setTab("productos")}
            className={`pb-2 px-1 text-sm font-bold flex items-center gap-2 ${tab === "productos" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-400"}`}
          >
            <MousePointerClick size={16} /> ASIGNAR A PRODUCTOS
          </button>
          <button
            type="button"
            onClick={() => setTab("categorias")}
            className={`pb-2 px-1 text-sm font-bold flex items-center gap-2 ${tab === "categorias" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-400"}`}
          >
            <Layers size={16} /> ASIGNAR A SECCIONES/CATEGORÍAS
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
          {tab === "productos" ? (
            <div className="flex flex-wrap gap-2">
              {productos.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border text-[11px] transition-all ${productosSeleccionados.includes(p.id) ? "bg-purple-600 text-white" : "bg-white text-gray-600"}`}
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
          ) : (
            <div className="space-y-4">
              {/* Selector de Secciones (Igual al de Producto) */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase mb-2">
                  1. Seleccionar Sección
                </p>
                <div className="flex flex-wrap gap-2">
                  {secciones.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border text-xs transition-all ${seccionesSeleccionadas.includes(s.id) ? "bg-purple-700 text-white" : "bg-white text-gray-500"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={seccionesSeleccionadas.includes(s.id)}
                        onChange={() => toggleSeccion(s.id)}
                      />
                      {s.nombre}
                    </label>
                  ))}
                </div>
              </div>

              {/* Selector de Categorías Tree (Igual al de Producto) */}
              {seccionesSeleccionadas.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase mb-2">
                    2. Seleccionar Categorías/Subcategorías
                  </p>
                  <div className="bg-white rounded-xl border p-2">
                    <CategoriaTreeSelector
                      categorias={categoriasData}
                      value={categoriasSeleccionadas}
                      onChange={setCategoriasSeleccionadas}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONFIGURACIÓN DINÁMICA DE LA PROMO */}
      <section className="grid grid-cols-2 gap-6 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
        {formData.tipo === "PORCENTAJE" && (
          <div className="col-span-2">
            <label className="text-sm font-bold text-purple-800">
              Porcentaje de Descuento (%)
            </label>
            <input
              type="number"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: Number(e.target.value) })
              }
              className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {formData.tipo === "CANTIDAD_X_CANTIDAD" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-purple-800">
                Lleva (Cantidad)
              </label>
              <input
                type="number"
                value={formData.lleva}
                onChange={(e) =>
                  setFormData({ ...formData, lleva: Number(e.target.value) })
                }
                className="border rounded-lg p-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-purple-800">
                Paga (Cantidad)
              </label>
              <input
                type="number"
                value={formData.paga}
                onChange={(e) =>
                  setFormData({ ...formData, paga: Number(e.target.value) })
                }
                className="border rounded-lg p-2"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-3 col-span-2 bg-white p-3 rounded-xl border border-purple-100">
          <input
            type="checkbox"
            id="acumulable"
            checked={formData.acumulable}
            onChange={(e) =>
              setFormData({ ...formData, acumulable: e.target.checked })
            }
            className="w-5 h-5 rounded text-purple-600"
          />
          <label
            htmlFor="acumulable"
            className="text-sm font-medium text-gray-700"
          >
            Permitir combinar diferentes productos de las categorías elegidas
          </label>
        </div>
      </section>

      {/* FECHAS Y PRIORIDAD */}
      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fecha Inicio</label>
          <input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) =>
              setFormData({ ...formData, fechaInicio: e.target.value })
            }
            className="border rounded-lg p-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fecha Fin</label>
          <input
            type="date"
            value={formData.fechaFin}
            onChange={(e) =>
              setFormData({ ...formData, fechaFin: e.target.value })
            }
            className="border rounded-lg p-2"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-2xl font-black text-white bg-purple-700 hover:bg-purple-800 shadow-xl transition-all transform active:scale-95 disabled:bg-gray-300"
      >
        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          "ACTIVAR PROMOCIÓN 🚀"
        )}
      </button>
    </form>
  );
};
