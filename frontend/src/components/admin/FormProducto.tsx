"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  createProducto,
  publicarProducto,
  getSecciones,
  getCategorias,
} from "@/services/productos";

type Seccion = {
  id: string;
  nombre: string;
};

type Categoria = {
  id: string;
  nombre: string;
};

export default function FormProducto() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [stock, setStock] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagenSubidaUrl, setImagenSubidaUrl] = useState<string | null>(null);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seccionIdSeleccionada, setSeccionIdSeleccionada] = useState("");
  const [categoriaIdSeleccionada, setCategoriaIdSeleccionada] = useState("");

  // 🔁 Cargar secciones al montar el componente
  useEffect(() => {
    async function cargarSecciones() {
      try {
        const seccionesData = await getSecciones();
        setSecciones(seccionesData);
      } catch (error) {
        console.error("Error al cargar secciones", error);
      }
    }
    cargarSecciones();
  }, []);

  // 🔁 Cargar categorías según sección seleccionada
  useEffect(() => {
    if (!seccionIdSeleccionada) {
      setCategorias([]);
      setCategoriaIdSeleccionada("");
      return;
    }

    async function cargarCategorias() {
      try {
        const categoriasData = await getCategorias(seccionIdSeleccionada);
        setCategorias(categoriasData);
        setCategoriaIdSeleccionada("");
      } catch (error) {
        console.error("Error al cargar categorías", error);
        setCategorias([]);
      }
    }

    cargarCategorias();
  }, [seccionIdSeleccionada]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagen(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setStock("");
    setImagen(null);
    setPreviewUrl(null);
    setImagenSubidaUrl(null);
    setSeccionIdSeleccionada("");
    setCategoriaIdSeleccionada("");
    setCategorias([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagen) {
      toast.warning("⚠️ Selecciona una imagen");
      return;
    }

    if (!seccionIdSeleccionada || !categoriaIdSeleccionada) {
      toast.warning("⚠️ Selecciona sección y categoría");
      return;
    }

    const formData = new FormData();
    formData.append("file", imagen);
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", Number(precio).toString());
    formData.append("stock", Number(stock).toString());
    formData.append("categoriaId", categoriaIdSeleccionada);
    formData.append("seccionId", seccionIdSeleccionada);

    try {
      const productoCreado = await createProducto(formData);
      toast.success("✅ Producto creado correctamente");
      setImagenSubidaUrl(productoCreado.imagenUrl);

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
      className="space-y-4 max-w-lg mx-auto p-6 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg"
    >
      <label className="block font-medium text-gray-700">Nombre</label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
      />

      <label className="block font-medium text-gray-700">Precio</label>
      <input
        type="number"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
      />

      <label className="block font-medium text-gray-700">Stock</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
      />

      <label className="block font-medium text-gray-700">Descripción</label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
      />

      <label className="block font-medium text-gray-700">Sección</label>
      <select
        value={seccionIdSeleccionada}
        onChange={(e) => setSeccionIdSeleccionada(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
      >
        <option value="">Selecciona una sección</option>
        {secciones.map((sec) => (
          <option key={sec.id} value={sec.id}>
            {sec.nombre}
          </option>
        ))}
      </select>

      <label className="block font-medium text-gray-700">Categoría</label>
      <select
        value={categoriaIdSeleccionada}
        onChange={(e) => setCategoriaIdSeleccionada(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
        disabled={!seccionIdSeleccionada}
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>

      <label className="block font-medium text-gray-700">Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-700 transition"
        required
      />

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full max-h-64 object-contain border rounded"
          />
        </div>
      )}

      {/* Botón visible y estilizado */}
      <button
        type="submit"
        className="w-full bg-purple-700 text-white font-semibold px-4 py-2 rounded-md hover:bg-purple-800 transition-all shadow-md"
      >
        Publicar producto
      </button>

      {imagenSubidaUrl && (
        <div className="mt-6 p-4 border border-green-500 rounded bg-green-50 text-sm text-green-800">
          Imagen subida:
          <a
            href={imagenSubidaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1 text-blue-600"
          >
            Ver imagen
          </a>
        </div>
      )}
    </form>
  );
}
