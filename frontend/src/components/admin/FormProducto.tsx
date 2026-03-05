"use client";

import { useEffect, useState } from "react";
import {
  createProducto,
  publicarProducto,
  getSecciones,
  getCategoriasTree,
} from "@/services/productos";
import toast from "react-hot-toast";
import EditorDescripcion from "./EditorDescripcion";
import {
  XMarkIcon,
  CameraIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { CategoriaTreeSelector } from "../CategoriaTreeSelector";
import { COLOR_MAP } from "@/lib/colores";

type Seccion = { id: string; nombre: string };
type Categoria = {
  id: string;
  nombre: string;
  subcategorias?: Categoria[];
};

export default function FormProducto() {
  /* ---------------- STATE ---------------- */
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioPromocional, setPrecioPromocional] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");

  // Logística
  const [peso, setPeso] = useState("");
  const [profundidad, setProfundidad] = useState("");
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");

  // Errores de validación
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<
    string[]
  >([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<
    string[]
  >([]);

  /* Variantes */
  const [coloresSel, setColoresSel] = useState<string[]>([]);
  const [cortesSel, setCortesSel] = useState<string[]>([]);
  const [tallesSel, setTallesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- VALIDACIÓN EN TIEMPO REAL (SEGÚN MANUAL MICORREO) ---------------- */
  useEffect(() => {
    const newErrors: { [key: string]: string } = {};

    // Validación Peso (Máximo 25.000g = 25kg)
    if (peso) {
      const p = parseFloat(peso);
      if (isNaN(p) || p <= 0) {
        newErrors.peso = "El peso debe ser mayor a 0 kg";
      } else if (p > 25) {
        newErrors.peso = "Correo Argentino permite máximo 25kg";
      }
    }

    // Validación Dimensiones (Máximo 150cm por lado)
    const dims = { profundidad, ancho, alto };
    Object.entries(dims).forEach(([key, value]) => {
      if (value) {
        const v = parseInt(value);
        if (isNaN(v) || v <= 0) {
          newErrors[key] = "Debe ser mayor a 0 cm";
        } else if (v > 150) {
          newErrors[key] = "Máximo 150cm (Límite Correo)";
        }
      }
    });

    setErrors(newErrors);
  }, [peso, profundidad, ancho, alto]);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
  }, []);

  useEffect(() => {
    if (!seccionesSeleccionadas[0] || seccionesSeleccionadas[0].length < 10) {
      setCategoriasData([]);
      return;
    }
    getCategoriasTree(seccionesSeleccionadas[0])
      .then((data) => {
        if (data) setCategoriasData(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("No se pudieron cargar las categorías");
      });
  }, [seccionesSeleccionadas]);

  /* ---------------- HANDLERS ---------------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImagenes((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const eliminarImagen = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSeccion = (id: string) => {
    setSeccionesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    if (Object.keys(errors).length > 0)
      return toast.error("Corregí los errores de logística antes de continuar");

    if (!peso || !ancho || !alto || !profundidad)
      return toast.error("Todos los campos de logística son obligatorios");

    if (!imagenes.length) return toast.error("Agregá al menos una imagen");

    setLoading(true);
    const categoriaFinalId =
      categoriasSeleccionadas[categoriasSeleccionadas.length - 1];

    const formData = new FormData();
    imagenes.forEach((img) => formData.append("files", img));
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("stock", stock);

    // CONVERSIÓN A GRAMOS PARA LA API DE CORREO
    const pesoEnGramos = Math.round(parseFloat(peso) * 1000);
    formData.append("peso", pesoEnGramos.toString());

    formData.append("profundidad", profundidad);
    formData.append("ancho", ancho);
    formData.append("alto", alto);
    formData.append("categoriaId", categoriaFinalId);

    coloresSel.forEach((c) => formData.append("colores", c));
    tallesSel.forEach((t) => formData.append("talles", t));
    cortesSel.forEach((cor) => formData.append("cortes", cor));
    seccionesSeleccionadas.forEach((id) => formData.append("seccionesIds", id));

    if (precioPromocional)
      formData.append("precioPromocional", precioPromocional);

    try {
      const producto = await createProducto(formData);
      await publicarProducto(producto.id);
      toast.success("Producto creado y publicado");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error creando el producto");
      setLoading(false);
    }
  };

  const OPCIONES_COLORES = [
    "blanco",
    "negro",
    "gris",
    "chocolate",
    "azul",
    "crema",
    "beige",
    "verde",
    "violeta",
    "lila",
  ];
  const OPCIONES_CORTES = [
    "clásica",
    "oversize",
    "boxy fit",
    "musculosa oversize",
    "crop top",
  ];
  const OPCIONES_TALLES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white/70 backdrop-blur p-6 rounded-2xl shadow-xl space-y-6"
    >
      <h2 className="text-xl font-bold text-purple-900 border-b pb-2">
        Publicar Producto
      </h2>

      {/* DATOS BÁSICOS */}
      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Precio ($)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">
            Precio Promocional (opcional)
          </label>
          <input
            type="number"
            value={precioPromocional}
            onChange={(e) => setPrecioPromocional(e.target.value)}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </section>

      {/* LOGÍSTICA CORREO ARGENTINO */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-bold text-purple-800 uppercase tracking-wider">
            Logística (Correo Argentino)
          </p>
          <InformationCircleIcon className="w-4 h-4 text-purple-400" />
        </div>

        <section className="grid grid-cols-4 gap-3">
          {/* PESO */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500">
              PESO (KG)
            </label>
            <input
              placeholder="0.5"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className={`border rounded h-10 px-2 text-center text-sm ${errors.peso ? "border-red-500 bg-red-50" : "border-gray-300 shadow-sm"}`}
            />
            {errors.peso ? (
              <span className="text-[10px] text-red-600 font-medium">
                {errors.peso}
              </span>
            ) : (
              <span className="text-[9px] text-gray-400">Ej: 0.5 (500g)</span>
            )}
          </div>

          {/* PROFUNDIDAD */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500">
              LARGO (CM)
            </label>
            <input
              placeholder="20"
              value={profundidad}
              onChange={(e) => setProfundidad(e.target.value)}
              className={`border rounded h-10 px-2 text-center text-sm ${errors.profundidad ? "border-red-500 bg-red-50" : "border-gray-300 shadow-sm"}`}
            />
            {errors.profundidad && (
              <span className="text-[10px] text-red-600 font-medium">
                {errors.profundidad}
              </span>
            )}
          </div>

          {/* ANCHO */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500">
              ANCHO (CM)
            </label>
            <input
              placeholder="20"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
              className={`border rounded h-10 px-2 text-center text-sm ${errors.ancho ? "border-red-500 bg-red-50" : "border-gray-300 shadow-sm"}`}
            />
            {errors.ancho && (
              <span className="text-[10px] text-red-600 font-medium">
                {errors.ancho}
              </span>
            )}
          </div>

          {/* ALTO */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-gray-500">
              ALTO (CM)
            </label>
            <input
              placeholder="20"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
              className={`border rounded h-10 px-2 text-center text-sm ${errors.alto ? "border-red-500 bg-red-50" : "border-gray-300 shadow-sm"}`}
            />
            {errors.alto && (
              <span className="text-[10px] text-red-600 font-medium">
                {errors.alto}
              </span>
            )}
          </div>
        </section>
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Descripción del Producto
        </label>
        <EditorDescripcion value={descripcion} onChange={setDescripcion} />
      </div>

      {/* SECCIONES */}
      <div>
        <p className="font-medium mb-2 text-sm text-gray-700">
          Secciones donde aparecerá
        </p>
        <div className="flex flex-wrap gap-2">
          {secciones.map((s) => (
            <label
              key={s.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border text-sm ${seccionesSeleccionadas.includes(s.id) ? "bg-purple-600 border-purple-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-600 hover:border-purple-300"}`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={seccionesSeleccionadas.includes(s.id)}
                onChange={() => toggleSeccion(s.id)}
              />
              <span>{s.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div>
        <p className="font-medium mb-2 text-sm text-gray-700">
          Categoría y Subcategoría
        </p>
        <div className="border rounded-xl p-3 max-h-60 overflow-auto bg-white shadow-inner">
          <CategoriaTreeSelector
            categorias={categoriasData}
            value={categoriasSeleccionadas}
            onChange={setCategoriasSeleccionadas}
          />
        </div>
      </div>

      {/* IMÁGENES */}
      <div>
        <p className="font-medium mb-2 text-sm text-gray-700">
          Fotos del Producto
        </p>
        <div className="flex gap-4 flex-wrap">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24 group">
              <img
                src={url}
                alt="preview"
                className="w-full h-full object-cover rounded-xl border shadow-sm group-hover:brightness-75 transition-all"
              />
              <button
                type="button"
                onClick={() => eliminarImagen(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 border-2 border-dashed border-purple-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-300">
            <CameraIcon className="w-7 h-7" />
            <span className="text-[10px] mt-1 font-bold">Añadir</span>
            <input type="file" multiple hidden onChange={handleImageChange} />
          </label>
        </div>
      </div>

      {/* VARIANTES */}
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
        {/* Colores */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Colores</p>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {OPCIONES_COLORES.map((color) => (
              <label
                key={color}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm ${coloresSel.includes(color) ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-600"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={coloresSel.includes(color)}
                  onChange={() =>
                    setColoresSel((prev) =>
                      prev.includes(color)
                        ? prev.filter((c) => c !== color)
                        : [...prev, color],
                    )
                  }
                />
                <div
                  className="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: COLOR_MAP[color] || "#eee" }}
                />
                <span className="capitalize">{color}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Talles */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Talles</p>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {OPCIONES_TALLES.map((talle) => (
              <label
                key={talle}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm ${tallesSel.includes(talle) ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-600"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={tallesSel.includes(talle)}
                  onChange={() =>
                    setTallesSel((prev) =>
                      prev.includes(talle)
                        ? prev.filter((t) => t !== talle)
                        : [...prev, talle],
                    )
                  }
                />
                <span>{talle}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cortes */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Corte</p>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {OPCIONES_CORTES.map((corte) => (
              <label
                key={corte}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm ${cortesSel.includes(corte) ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-gray-50 text-gray-600"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={cortesSel.includes(corte)}
                  onChange={() =>
                    setCortesSel((prev) =>
                      prev.includes(corte)
                        ? prev.filter((c) => c !== corte)
                        : [...prev, corte],
                    )
                  }
                />
                <span className="capitalize">{corte}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || Object.keys(errors).length > 0}
        className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${loading || Object.keys(errors).length > 0 ? "bg-gray-300 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"}`}
      >
        {loading ? "PUBLICANDO..." : "PUBLICAR PRODUCTO"}
      </button>
    </form>
  );
}
