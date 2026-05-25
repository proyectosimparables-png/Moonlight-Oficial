"use client";

import { useEffect, useState } from "react";
import { getSecciones, getCategoriasTree } from "@/services/products-service";
// ✅ Traemos las acciones de creación y publicación desde su ubicación real
import {
  createProducto,
  publicarProducto,
} from "@/services/admin/admin-products-actions";
import toast from "react-hot-toast";
import EditorDescripcion from "./EditorDescripcion";
import {
  XMarkIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { CategoriaTreeSelector } from "../products/Categoria-Tree-Selector";
import Image from "next/image";

// --- INTERFACES DE TIPADO ---
interface VarianteEstado {
  id: string;
  talle: string;
  color: string;
  stock: string;
  seguimiento: boolean;
}

interface Seccion {
  id: string;
  nombre: string;
}

interface CategoriaNode {
  id: string;
  nombre: string;
  children?: CategoriaNode[];
}

export default function FormProducto() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioPromocional, setPrecioPromocional] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // LOGÍSTICA (Correo Argentino)
  const [peso, setPeso] = useState("");
  const [profundidad, setProfundidad] = useState("");
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // ESTADOS TIPADOS
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categoriasData, setCategoriasData] = useState<CategoriaNode[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    string[]
  >([]);

  // VARIANTES
  const [variantesData, setVariantesData] = useState<VarianteEstado[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ESTADO TEMPORAL DEL DRAWER
  const [tempColor, setTempColor] = useState("");
  const [tempTalle, setTempTalle] = useState("");
  const [tempStock, setTempStock] = useState("0");
  const [tempSeguimiento, setTempSeguimiento] = useState(true);

  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE VALIDACIÓN ---
  const isFormValid =
    nombre.trim() !== "" &&
    precio !== "" &&
    peso !== "" &&
    alto !== "" &&
    ancho !== "" &&
    profundidad !== "" &&
    seccionesSeleccionadas.length > 0 &&
    categoriasSeleccionadas.length > 0 &&
    variantesData.length > 0 &&
    imagenes.length > 0;

  // Carga inicial de secciones
  useEffect(() => {
    getSecciones()
      .then((data: Seccion[]) => {
        console.log("📂 Secciones cargadas:", data);
        setSecciones(data);
      })
      .catch((err) => console.error("❌ Error al cargar secciones:", err));
  }, []);

  // Carga de categorías según la sección seleccionada
  useEffect(() => {
    async function fetchCategorias() {
      // 1. Validamos que realmente haya una sección seleccionada
      if (seccionesSeleccionadas.length > 0) {
        const ultimaSeccionId =
          seccionesSeleccionadas[seccionesSeleccionadas.length - 1];

        // 2. IMPORTANTE: Si el ID es un objeto o undefined, el fetch del servicio fallará
        if (!ultimaSeccionId || typeof ultimaSeccionId !== "string") return;

        try {
          console.log("🔍 Buscando categorías para sección:", ultimaSeccionId);
          const data = await getCategoriasTree(ultimaSeccionId);

          // 3. Forzamos la actualización solo si recibimos un array
          if (Array.isArray(data)) {
            setCategoriasData(data);
          } else {
            setCategoriasData([]);
          }
        } catch (err) {
          console.error("❌ Error en getCategoriasTree:", err);
          setCategoriasData([]);
        }
      } else {
        setCategoriasData([]);
      }
    }
    fetchCategorias();
  }, [seccionesSeleccionadas]);
  const openDrawer = (variante?: VarianteEstado) => {
    if (variante) {
      setEditingId(variante.id);
      setTempColor(variante.color);
      setTempTalle(variante.talle);
      setTempStock(variante.stock);
      setTempSeguimiento(variante.seguimiento);
    } else {
      setEditingId(null);
      setTempColor("");
      setTempTalle("");
      setTempStock("0");
      setTempSeguimiento(true);
    }
    setIsDrawerOpen(true);
  };

  const handleSaveVariante = () => {
    if (!tempColor || !tempTalle)
      return toast.error("Seleccioná color y talle");
    const id = `${tempColor}-${tempTalle}`;
    if (!editingId && variantesData.find((v) => v.id === id)) {
      return toast.error("Esta variante ya existe");
    }
    const nueva: VarianteEstado = {
      id,
      color: tempColor,
      talle: tempTalle,
      stock: tempStock,
      seguimiento: tempSeguimiento,
    };
    if (editingId) {
      setVariantesData(
        variantesData.map((v) => (v.id === editingId ? nueva : v)),
      );
    } else {
      setVariantesData([...variantesData, nueva]);
    }
    setIsDrawerOpen(false);
    toast.success(editingId ? "Variante actualizada" : "Variante agregada");
  };

  const removeVariante = (id: string) => {
    setVariantesData(variantesData.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      console.warn(
        "⚠️ Formulario incompleto. Revisa campos obligatorios e imágenes.",
      );
      return;
    }

    setLoading(true);
    console.group("🚀 Moonlight: Enviando Producto");

    const formData = new FormData();

    // 1. Procesar variantes
    const variantesFinal = variantesData.map((v) => ({
      talle: v.talle,
      color: v.color,
      stock: v.seguimiento ? parseInt(v.stock) || 0 : null,
      sku: `${nombre.substring(0, 3).toUpperCase()}-${v.color.substring(0, 3).toUpperCase()}-${v.talle}`,
    }));

    // 2. Adjuntar archivos
    imagenes.forEach((img) => formData.append("files", img));

    // 3. Datos básicos y logística
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("peso", peso);
    formData.append("profundidad", profundidad);
    formData.append("ancho", ancho);
    formData.append("alto", alto);

    // 4. Categoría y Secciones
    const catId = categoriasSeleccionadas[categoriasSeleccionadas.length - 1];
    formData.append("categoriaId", catId);
    seccionesSeleccionadas.forEach((id) => formData.append("seccionesIds", id));

    // 5. Variantes y Promos
    formData.append("variantes", JSON.stringify(variantesFinal));
    if (precioPromocional)
      formData.append("precioPromocional", precioPromocional);

    // LOGS DE SALIDA
    console.log("📁 FormData - Secciones:", seccionesSeleccionadas);
    console.log("📁 FormData - Categoria Final:", catId);
    console.log("📁 FormData - Variantes:", variantesFinal);
    console.groupEnd();

    try {
      const prod = await createProducto(formData);
      console.log("✅ Producto creado:", prod);

      await publicarProducto(String(prod.id));
      console.log("📢 Producto publicado correctamente.");

      toast.success("¡Producto publicado en Moonlight!");

      // 🌟 REINICIO TOTAL DEL FORMULARIO TRAS EL ÉXITO 🌟
      // Revocamos las URLs temporales de las imágenes para liberar memoria
      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      // Limpieza de campos de texto y precios
      setNombre("");
      setPrecio("");
      setPrecioPromocional("");
      setDescripcion("");

      // Limpieza de logística
      setPeso("");
      setAlto("");
      setAncho("");
      setProfundidad("");

      // Limpieza de archivos y previsualizaciones
      setImagenes([]);
      setPreviewUrls([]);

      // Limpieza de relaciones y variantes
      setSeccionesSeleccionadas([]);
      setCategoriasSeleccionadas([]);
      setVariantesData([]);

      // Desactivamos el estado de carga
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fatal al crear/publicar:", error);
      toast.error("Error al crear el producto");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-10"
      >
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">
          Nuevo Producto Moonlight
        </h2>

        {/* DATOS BÁSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto"
            className="col-span-2 border-2 p-3 rounded-xl outline-none focus:border-purple-500"
            required
          />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Precio ($)"
            className="border-2 p-3 rounded-xl outline-none focus:border-purple-500"
            required
          />
          <input
            type="number"
            value={precioPromocional}
            onChange={(e) => setPrecioPromocional(e.target.value)}
            placeholder="Precio Promocional (Opcional)"
            className="border-2 p-3 rounded-xl outline-none"
          />
        </div>

        {/* VARIANTES */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Variantes de stock</h3>
            <button
              type="button"
              onClick={() => openDrawer()}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> Agregar Variante
            </button>
          </div>

          <div className="border rounded-xl overflow-hidden bg-gray-50">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 font-bold text-gray-600 border-b">
                <tr>
                  <th className="p-4">Color / Talle</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variantesData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-8 text-center text-gray-400 italic"
                    >
                      No hay variantes agregadas aún
                    </td>
                  </tr>
                ) : (
                  variantesData.map((v) => (
                    <tr
                      key={v.id}
                      className="bg-white hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 capitalize font-medium">
                        {v.color} - {v.talle}
                      </td>
                      <td className="p-4">{v.seguimiento ? v.stock : "∞"}</td>
                      <td className="p-4 flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => openDrawer(v)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVariante(v.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* LOGÍSTICA */}
        <section className="space-y-4">
          <h3 className="font-bold text-gray-700">Envío (Correo Argentino)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="border-2 p-2 rounded-lg outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Alto (cm)
              </label>
              <input
                type="number"
                value={alto}
                onChange={(e) => setAlto(e.target.value)}
                className="border-2 p-2 rounded-lg outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Ancho (cm)
              </label>
              <input
                type="number"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
                className="border-2 p-2 rounded-lg outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Largo (cm)
              </label>
              <input
                type="number"
                value={profundidad}
                onChange={(e) => setProfundidad(e.target.value)}
                className="border-2 p-2 rounded-lg outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>
        </section>

        {/* CATEGORÍAS Y SECCIONES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Sección</p>
            <div className="flex flex-wrap gap-2">
              {secciones.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeccionesSeleccionadas([s.id])}
                  className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${seccionesSeleccionadas.includes(s.id) ? "bg-purple-600 border-purple-600 text-white" : "bg-white text-gray-400"}`}
                >
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Categoría</p>
            <div className="border-2 rounded-xl p-4 h-40 overflow-y-auto bg-gray-50">
              <CategoriaTreeSelector
                categorias={categoriasData}
                value={categoriasSeleccionadas}
                onChange={setCategoriasSeleccionadas}
              />
            </div>
          </div>
        </section>

        {/* FOTOS */}
        <section>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Fotos del producto
          </p>
          <div className="flex flex-wrap gap-4">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative w-24 h-24">
                <Image
                  src={url}
                  alt="preview"
                  fill
                  className="object-cover rounded-xl border"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagenes((prev) => prev.filter((_, idx) => idx !== i));
                    setPreviewUrls((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <CameraIcon className="w-6 h-6 text-gray-300" />
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImagenes((prev) => [...prev, ...files]);
                  setPreviewUrls((prev) => [
                    ...prev,
                    ...files.map((f) => URL.createObjectURL(f)),
                  ]);
                }}
              />
            </label>
          </div>
        </section>

        <EditorDescripcion value={descripcion} onChange={setDescripcion} />

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
            loading || !isFormValid
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]"
          }`}
        >
          {loading
            ? "PUBLICANDO..."
            : isFormValid
              ? "PUBLICAR PRODUCTO"
              : "FALTAN COMPLETAR DATOS"}
        </button>
      </form>

      {/* --- DRAWER LATERAL --- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col space-y-8 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Editar" : "Agregar"} Variante
              </h3>
              <button onClick={() => setIsDrawerOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Color</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "blanco",
                    "negro",
                    "gris",
                    "azul",
                    "marron",
                    "crema",
                    "verde",
                    "rosa",
                    "beige",
                    "violeta",
                    "rojo",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTempColor(c)}
                      className={`px-4 py-2 rounded-full border-2 text-xs capitalize transition-all ${tempColor === c ? "bg-black border-black text-white" : "bg-white text-gray-500 hover:border-purple-300"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Talle</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "S",
                    "M",
                    "L",
                    "XL",
                    "XXL",
                    "Único",
                    "34",
                    "36",
                    "38",
                    "40",
                    "42",
                    "44",
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTempTalle(t)}
                      className={`px-4 py-2 rounded-full border-2 text-xs transition-all ${tempTalle === t ? "bg-black border-black text-white" : "bg-white text-gray-500 hover:border-purple-300"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-4 border">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">
                    Seguimiento de stock
                  </label>
                  <input
                    type="checkbox"
                    checked={tempSeguimiento}
                    onChange={(e) => setTempSeguimiento(e.target.checked)}
                    className="w-5 h-5 accent-purple-600"
                  />
                </div>
                {tempSeguimiento && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-bold">
                      CANTIDAD EN STOCK
                    </label>
                    <input
                      type="number"
                      value={tempStock}
                      onChange={(e) => setTempStock(e.target.value)}
                      className="w-full border-2 p-2 rounded-lg outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveVariante}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 mt-auto transition-all"
            >
              {editingId ? "GUARDAR CAMBIOS" : "LISTO (OK)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
