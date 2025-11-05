"use client";

import { useState, useEffect } from "react";
import {
  createProducto,
  publicarProducto,
  getSecciones,
  getCategorias,
} from "@/services/productos";
import { CameraIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

type Seccion = { id: string; nombre: string };
type Categoria = { id: string; nombre: string };

export default function FormProducto() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenSubidaUrl, setImagenSubidaUrl] = useState<string | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seccionIdSeleccionada, setSeccionIdSeleccionada] = useState("");
  const [categoriaIdSeleccionada, setCategoriaIdSeleccionada] = useState("");

  // 🔁 Cargar secciones
  useEffect(() => {
    (async () => {
      try {
        const seccionesData = await getSecciones();
        setSecciones(seccionesData);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // 🔁 Cargar categorías
  useEffect(() => {
    if (!seccionIdSeleccionada) {
      setCategorias([]);
      setCategoriaIdSeleccionada("");
      return;
    }
    (async () => {
      try {
        const categoriasData = await getCategorias(seccionIdSeleccionada);
        setCategorias(categoriasData);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [seccionIdSeleccionada]);

  // 📸 Manejo de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const nuevasImagenes = [...imagenes, ...files];
    setImagenes(nuevasImagenes);

    const nuevasUrls = nuevasImagenes.map((file) => URL.createObjectURL(file));
    setPreviewUrls(nuevasUrls);
  };

  const eliminarImagen = (index: number) => {
    const nuevas = [...imagenes];
    nuevas.splice(index, 1);
    setImagenes(nuevas);

    const nuevasUrls = [...previewUrls];
    nuevasUrls.splice(index, 1);
    setPreviewUrls(nuevasUrls);
  };

  // 🔁 Reset form
  const resetForm = () => {
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setStock("");
    setImagenes([]);
    setPreviewUrls([]);
    setImagenSubidaUrl(null);
    setSeccionIdSeleccionada("");
    setCategoriaIdSeleccionada("");
  };

  // 🚀 Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (imagenes.length === 0) {
      toast("⚠️ Debes agregar al menos una imagen");
      return;
    }

    const formData = new FormData();
    imagenes.forEach((img) => formData.append("files", img)); // 👈 múltiples imágenes
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("categoriaId", categoriaIdSeleccionada);
    formData.append("seccionId", seccionIdSeleccionada);

    try {
      const productoCreado = await createProducto(formData);
      toast.success("✅ Producto creado correctamente");
      await publicarProducto(productoCreado.id);
      toast("🚀 Producto publicado");
      resetForm();
    } catch (error) {
      toast.error("❌ Error al crear producto");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-lg mx-auto p-6 bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl"
    >
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
          required
        />

        <label className="block font-medium text-gray-700">Precio</label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
          required
        />

        <label className="block font-medium text-gray-700">Stock</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
          required
        />

        <label className="block font-medium text-gray-700">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
        />

        <label className="block font-medium text-gray-700">Sección</label>
        <select
          value={seccionIdSeleccionada}
          onChange={(e) => setSeccionIdSeleccionada(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
          required
        >
          <option value="">Selecciona una sección</option>
          {secciones.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <label className="block font-medium text-gray-700">Categoría</label>
        <select
          value={categoriaIdSeleccionada}
          onChange={(e) => setCategoriaIdSeleccionada(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-600"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* 📸 Sección de imágenes */}
      <div>
        <label className="block font-medium text-gray-700 mb-2">
          Imágenes del producto
        </label>

        <div className="flex flex-wrap gap-3">
          {/* Miniaturas de imágenes cargadas */}
          {previewUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24">
              <img
                src={url}
                alt="preview"
                className="w-full h-full object-cover rounded-lg border border-gray-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => eliminarImagen(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Botón para agregar más imágenes */}
          <label
            htmlFor="imagenes"
            className="w-24 h-24 border-2 border-dashed border-purple-400 rounded-lg flex flex-col items-center justify-center text-purple-600 hover:bg-purple-50 transition cursor-pointer"
          >
            {previewUrls.length > 0 ? (
              <PlusIcon className="w-10 h-10" />
            ) : (
              <CameraIcon className="w-10 h-10" />
            )}
            <span className="text-xs mt-1">
              {previewUrls.length > 0 ? "Agregar más" : "Subir"}
            </span>
            <input
              id="imagenes"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Botón de submit */}
      <button
        type="submit"
        className="w-full bg-purple-700 text-white font-semibold px-4 py-2 rounded-md hover:bg-purple-800 transition-all shadow-md"
      >
        Publicar producto
      </button>
    </form>
  );
}
