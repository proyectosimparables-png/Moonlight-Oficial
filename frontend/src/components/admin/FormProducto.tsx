"use client";

import { useEffect, useState } from "react";
import {
  createProducto,
  publicarProducto,
  getSecciones,
  getCategorias,
} from "@/services/productos";
import toast from "react-hot-toast";
import EditorDescripcion from "./EditorDescripcion";
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/solid";
import { CategoriaTreeSelector } from "../CategoriaTreeSelector";

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

  const [peso, setPeso] = useState("");
  const [profundidad, setProfundidad] = useState("");
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");

  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<string[]>([]);
  const [categoriaId, setCategoriaId] = useState("");

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
  }, []);

  useEffect(() => {
    if (seccionesSeleccionadas.length === 0) {
      setCategorias([]);
      setCategoriaId("");
      return;
    }

    getCategorias(seccionesSeleccionadas[0])
      .then(setCategorias)
      .catch(console.error);
  }, [seccionesSeleccionadas]);

  /* ---------------- IMÁGENES ---------------- */

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

  /* ---------------- SECCIONES ---------------- */

  const toggleSeccion = (id: string) => {
    setSeccionesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagenes.length) {
      return toast.error("Agregá al menos una imagen");
    }

    if (!seccionesSeleccionadas.length) {
      return toast.error("Seleccioná al menos una sección");
    }

    if (!categoriaId) {
      return toast.error("Seleccioná una categoría");
    }

    if (
      precioPromocional &&
      Number(precioPromocional) >= Number(precio)
    ) {
      return toast.error(
        "El precio promocional debe ser menor al precio",
      );
    }

    const formData = new FormData();

    /* imágenes */
    imagenes.forEach((img) => formData.append("files", img));

    /* datos base */
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("stock", stock);
    formData.append("categoriaId", categoriaId);

    if (precioPromocional) {
      formData.append("precioPromocional", precioPromocional);
    }

    /* dimensiones (solo si existen) */
    if (peso) formData.append("peso", peso);
    if (profundidad) formData.append("profundidad", profundidad);
    if (ancho) formData.append("ancho", ancho);
    if (alto) formData.append("alto", alto);

    /* secciones -> JSON */
    formData.append(
      "seccionesIds",
      JSON.stringify(seccionesSeleccionadas),
    );

    try {
      const producto = await createProducto(formData);
      await publicarProducto(producto.id);

      toast.success("Producto creado y publicado");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error creando el producto");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white/70 backdrop-blur p-6 rounded-2xl shadow-xl space-y-6"
    >
      <h2 className="text-xl font-semibold">Nuevo producto</h2>

      {/* DATOS */}
      <section className="grid grid-cols-2 gap-4">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <input
          placeholder="Precio"
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />

        <input
          placeholder="Precio promocional"
          type="number"
          value={precioPromocional}
          onChange={(e) => setPrecioPromocional(e.target.value)}
        />
      </section>

      {/* ENVÍOS */}
      <section className="grid grid-cols-4 gap-3">
        <input placeholder="Peso (kg)" value={peso} onChange={(e) => setPeso(e.target.value)} />
        <input placeholder="Prof. (cm)" value={profundidad} onChange={(e) => setProfundidad(e.target.value)} />
        <input placeholder="Ancho (cm)" value={ancho} onChange={(e) => setAncho(e.target.value)} />
        <input placeholder="Alto (cm)" value={alto} onChange={(e) => setAlto(e.target.value)} />
      </section>

      {/* DESCRIPCIÓN */}
      <EditorDescripcion value={descripcion} onChange={setDescripcion} />

      {/* SECCIONES */}
      <div>
        <p className="font-medium mb-2">Secciones</p>
        <div className="flex flex-wrap gap-3">
          {secciones.map((s) => (
            <label key={s.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={seccionesSeleccionadas.includes(s.id)}
                onChange={() => toggleSeccion(s.id)}
              />
              {s.nombre}
            </label>
          ))}
        </div>
      </div>

      {/* CATEGORÍA */}
      <div>
        <p className="font-medium mb-2">Categoría</p>
        <div className="border rounded-lg p-3 max-h-72 overflow-auto bg-white">
          <CategoriaTreeSelector
            categorias={categorias}
            value={categoriaId}
            onChange={setCategoriaId}
          />
        </div>
      </div>

      {/* IMÁGENES */}
      <div className="flex gap-3 flex-wrap">
        {previewUrls.map((url, i) => (
          <div key={i} className="relative w-24 h-24">
            <img
              src={url}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => eliminarImagen(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        <label className="w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer">
          <CameraIcon className="w-6 h-6" />
          <input type="file" multiple hidden onChange={handleImageChange} />
        </label>
      </div>

      <button className="w-full bg-purple-700 text-white py-2 rounded-md">
        Publicar producto
      </button>
    </form>
  );
}
