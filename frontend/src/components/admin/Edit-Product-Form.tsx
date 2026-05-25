"use client";

import { useEffect, useState } from "react";
import { getSecciones, getCategoriasTree } from "@/services/products-service";
import {
  updateProductoFlexible,
  removeImagenProducto,
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
import { Loader2 } from "lucide-react";

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

interface ProductoBackendOriginal {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
  precio: number | string;
  precioPromocional?: number | string | null;
  peso?: number | string;
  alto?: number | string;
  ancho?: number | string;
  profundidad?: number | string;
  secciones?: Array<{ id?: string; seccionId?: string; nombre?: string }>;
  seccionesIds?: string[];
  imagenUrl?: string | null;
  categoria?: {
    id: string;
    nombre?: string;
    parentId?: string | null;
    seccionId?: string | null;
    [key: string]: unknown;
  } | null;
  imagenes?: Array<string | { id: string | number; url: string }>;
  variantes?: Array<{
    id?: string;
    talle: string;
    color: string;
    stock: number | null;
  }>;
  [key: string]: unknown;
}

interface EditarProductoFormProps {
  producto: ProductoBackendOriginal;
  onCancel: () => void;
  onUpdate: () => void;
}

export default function EditarProductoForm({
  producto,
  onCancel,
  onUpdate,
}: EditarProductoFormProps) {
  console.log("¡AYUDA MOONLIGHT! El producto original trae esto:", producto);
  console.log("¿Qué hay dentro de producto.categoria?", producto.categoria);
  // --- DATOS BÁSICOS ---
  const [nombre, setNombre] = useState(producto.nombre || "");
  const [precio, setPrecio] = useState(String(producto.precio || ""));
  const [precioPromocional, setPrecioPromocional] = useState(
    producto.precioPromocional ? String(producto.precioPromocional) : "",
  );
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");

  // --- LOGÍSTICA ---
  const [peso, setPeso] = useState(
    String(producto.peso || producto.pesoKg || "0"),
  );
  const [alto, setAlto] = useState(
    String(producto.alto || producto.altoCm || "0"),
  );
  const [ancho, setAncho] = useState(
    String(producto.ancho || producto.anchoCm || "0"),
  );
  const [profundidad, setProfundidad] = useState(
    String(producto.profundidad || producto.largo || "0"),
  );
  // --- IMÁGENES EXISTENTES ---
  const [imagenesExistentes, setImagenesExistentes] = useState<
    Array<{ id: string; url: string }>
  >(() => {
    if (producto.imagenUrl && typeof producto.imagenUrl === "string") {
      return [{ id: "old-main", url: producto.imagenUrl }];
    }

    if (Array.isArray(producto.imagenes)) {
      return producto.imagenes
        .map((img, idx) => {
          if (typeof img === "string") return { id: `old-${idx}`, url: img };
          if (img && typeof img === "object" && "url" in img) {
            const objImg = img as { id?: string | number; url: string };
            return {
              id: objImg.id ? String(objImg.id) : `old-obj-${idx}`,
              url: objImg.url,
            };
          }
          return null;
        })
        .filter((img): img is { id: string; url: string } => img !== null);
    }

    return [];
  });

  const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // --- RELACIONES Y CATEGORÍAS ---
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categoriasData, setCategoriasData] = useState<CategoriaNode[]>([]);

  // ✅ CORREGIDO: Inicialización precisa de secciones activas usando la metadata del backend reformado
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    string[]
  >(() => {
    if (
      producto.seccionesIds &&
      (producto.seccionesIds as string[]).length > 0
    ) {
      return producto.seccionesIds as string[];
    }
    if (
      producto.categoria &&
      typeof producto.categoria === "object" &&
      "seccionId" in producto.categoria
    ) {
      return [producto.categoria.seccionId as string];
    }
    return [];
  });

  // ✅ CORREGIDO: Estructura de árbol genealógico [Padre, Hijo] para que el selector sepa dónde pararse
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >(() => {
    if (!producto.categoria) return [];
    if (producto.categoria.parentId) {
      return [producto.categoria.parentId as string, producto.categoria.id];
    }
    return [producto.categoria.id];
  });

  // --- VARIANTES ---
  const [variantesData, setVariantesData] = useState<VarianteEstado[]>(() => {
    return (producto.variantes || []).map((v, idx) => ({
      id: v.id || `${v.color}-${v.talle}-${idx}`,
      color: v.color,
      talle: v.talle,
      stock: v.stock !== null ? String(v.stock) : "0",
      seguimiento: v.stock !== null,
    }));
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- ESTADO TEMPORAL DEL DRAWER ---
  const [tempColor, setTempColor] = useState("");
  const [tempTalle, setTempTalle] = useState("");
  const [tempStock, setTempStock] = useState("0");
  const [tempSeguimiento, setTempSeguimiento] = useState(true);

  const [loading, setLoading] = useState(false);

  // --- VALIDACIÓN DE FORMULARIO ---
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
    (imagenesExistentes.length > 0 || imagenesNuevas.length > 0);

  // Carga inicial de secciones
  useEffect(() => {
    getSecciones()
      .then((data: Seccion[]) => setSecciones(data))
      .catch((err) => console.error("❌ Error al cargar secciones:", err));
  }, []);

  // Carga reactiva de categorías dinámicas basadas en la sección elegida
  useEffect(() => {
    async function fetchCategorias() {
      if (seccionesSeleccionadas.length > 0) {
        const ultimaSeccionId =
          seccionesSeleccionadas[seccionesSeleccionadas.length - 1];
        if (!ultimaSeccionId || typeof ultimaSeccionId !== "string") return;

        try {
          const data = await getCategoriasTree(ultimaSeccionId);
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

  // --- ACCIONES DEL DRAWER DE VARIANTES ---
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

    if (
      !editingId &&
      variantesData.find((v) => v.color === tempColor && v.talle === tempTalle)
    ) {
      return toast.error("Esta variante ya existe");
    }

    const nueva: VarianteEstado = {
      id: editingId || id,
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

  // --- ENVÍO DE DATOS ACTUALIZADOS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    console.group("🚀 Moonlight: Actualizando Producto");

    const formData = new FormData();

    // 1. Mapear variantes al contrato definitivo del backend
    const variantesFinal = variantesData.map((v) => ({
      talle: v.talle,
      color: v.color,
      stock: v.seguimiento ? parseInt(v.stock, 10) || 0 : null,
      sku: `${nombre.substring(0, 3).toUpperCase()}-${v.color.substring(0, 3).toUpperCase()}-${v.talle}`,
    }));

    // 2. Adjuntar las imágenes físicas nuevas
    imagenesNuevas.forEach((img) => formData.append("files", img));

    // 3. Adjuntar campos nativos
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("peso", peso);
    formData.append("profundidad", profundidad);
    formData.append("ancho", ancho);
    formData.append("alto", alto);

    // ✅ SI CONSERVA LA IMAGEN ANTERIOR SIN REEMPLAZARLA: La mandamos explícitamente para evitar borrados
    if (imagenesExistentes.length > 0 && imagenesNuevas.length === 0) {
      formData.append("imagenUrl", imagenesExistentes[0].url);
    }

    // 4. Categoría e Identificadores de Secciones
    const catId = categoriasSeleccionadas[categoriasSeleccionadas.length - 1];
    formData.append("categoriaId", catId);
    seccionesSeleccionadas.forEach((id) => formData.append("seccionesIds", id));

    // 5. Variantes estructuradas y precio promocional opcional
    formData.append("variantes", JSON.stringify(variantesFinal));
    if (precioPromocional)
      formData.append("precioPromocional", precioPromocional);

    console.groupEnd();

    try {
      await updateProductoFlexible(producto.id.toString(), formData);
      toast.success("¡Producto actualizado correctamente!");

      // Liberar memoria de blobs
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      onUpdate();
    } catch (error) {
      console.error("❌ Error fatal al actualizar:", error);
      toast.error("Error al actualizar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pb-10 text-black">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-10"
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Editar Producto: {producto.nombre}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 font-semibold text-sm"
          >
            Volver
          </button>
        </div>

        {/* DATOS BÁSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">
              NOMBRE DEL PRODUCTO
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del producto"
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              PRECIO ($)
            </label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="Precio ($)"
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              PRECIO PROMOCIONAL (OPCIONAL)
            </label>
            <input
              type="number"
              value={precioPromocional}
              onChange={(e) => setPrecioPromocional(e.target.value)}
              placeholder="Precio Promocional"
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* VARIANTES ACTUALES */}
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

        {/* LOGÍSTICA CORREO ARGENTINO */}
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
            <p className="text-sm font-bold text-gray-700 mb-2">
              Sección active
            </p>
            <div className="flex flex-wrap gap-2">
              {secciones.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeccionesSeleccionadas([s.id])}
                  className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    seccionesSeleccionadas.includes(s.id)
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white text-gray-400"
                  }`}
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

        {/* CONTROL DE FOTOS */}
        <section>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Fotos del producto
          </p>
          <div className="flex flex-wrap gap-4">
            {imagenesExistentes.map((img) => (
              <div key={img.id} className="relative w-24 h-24 group">
                <Image
                  src={img.url}
                  alt="Actual del base"
                  fill
                  className="object-cover rounded-xl border"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeImagenProducto(img.id);
                      setImagenesExistentes((prev) =>
                        prev.filter((item) => item.id !== img.id),
                      );
                      toast.success("Imagen eliminada de Moonlight");
                    } catch {
                      toast.error("Error al remover del servidor");
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md opacity-90 hover:opacity-100"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            ))}

            {previewUrls.map((url, i) => (
              <div
                key={i}
                className="relative w-24 h-24 border-2 border-purple-400 rounded-xl"
              >
                <Image
                  src={url}
                  alt="preview nueva"
                  fill
                  className="object-cover rounded-xl"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagenesNuevas((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    );
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
                  setImagenesNuevas((prev) => [...prev, ...files]);
                  setPreviewUrls((prev) => [
                    ...prev,
                    ...files.map((f) => URL.createObjectURL(f)),
                  ]);
                }}
                accept="image/*"
              />
            </label>
          </div>
        </section>

        <EditorDescripcion value={descripcion} onChange={setDescripcion} />

        {/* BOTONES FINALES */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-1/3 py-4 rounded-xl border-2 font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            CANCELAR
          </button>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-2/3 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading || !isFormValid
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                GUARDANDO CAMBIOS...
              </>
            ) : isFormValid ? (
              "GUARDAR CAMBIOS"
            ) : (
              "FALTAN COMPLETAR DATOS"
            )}
          </button>
        </div>
      </form>

      {/* --- DRAWER LATERAL DE VARIANTES --- */}
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
                      className={`px-4 py-2 rounded-full border-2 text-xs capitalize transition-all ${
                        tempColor === c
                          ? "bg-black border-black text-white"
                          : "bg-white text-gray-500 hover:border-purple-300"
                      }`}
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
                      className={`px-4 py-2 rounded-full border-2 text-xs transition-all ${
                        tempTalle === t
                          ? "bg-black border-black text-white"
                          : "bg-white text-gray-500 hover:border-purple-300"
                      }`}
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
