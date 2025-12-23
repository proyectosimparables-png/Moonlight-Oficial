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
  
  // 🔹 DIFERENCIAMOS: Los datos que vienen del servidor vs los IDs que marca el usuario
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);

  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<string[]>([]);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
  }, []);

  useEffect(() => {
    if (seccionesSeleccionadas.length === 0) {
      setCategoriasData([]);
      setCategoriasSeleccionadas([]);
      return;
    }

    // Traemos el árbol de categorías de la sección elegida
    getCategorias(seccionesSeleccionadas[0])
      .then(setCategoriasData)
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

    if (!imagenes.length) return toast.error("Agregá al menos una imagen");
    if (!seccionesSeleccionadas.length) return toast.error("Seleccioná al menos una sección");
    if (categoriasSeleccionadas.length === 0) return toast.error("Seleccioná al menos una categoría");
    const categoriaFinalId =
  categoriasSeleccionadas[categoriasSeleccionadas.length - 1];

    const formData = new FormData();

    imagenes.forEach((img) => formData.append("files", img));

    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("stock", stock);

    // 🔹 Enviamos el array de categorías como JSON
    formData.append("categoriaId", categoriaFinalId);


    if (precioPromocional) formData.append("precioPromocional", precioPromocional);
    if (peso) formData.append("peso", peso);
    if (profundidad) formData.append("profundidad", profundidad);
    if (ancho) formData.append("ancho", ancho);
    if (alto) formData.append("alto", alto);

   seccionesSeleccionadas.forEach((id) =>
  formData.append("seccionesIds", id),
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

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white/70 backdrop-blur p-6 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-xl font-semibold">Nuevo producto</h2>

        {/* DATOS */}

      <section className="grid grid-cols-2 gap-4">

        <label>Nombre

          <input

            value={nombre}

            onChange={(e) => setNombre(e.target.value)}

            className="border rounded-lg p-2 col-span-2"

            required

          />

        </label>

        <label>Stock

          <input

            type="number"

            value={stock}

            onChange={(e) => setStock(e.target.value)}

            className="border rounded-lg p-2 col-span-2"

            required

          />

        </label>


        <label>Precio

          <input

            type="number"

            value={precio}

            onChange={(e) => setPrecio(e.target.value)}

            className="border rounded p-2 col-span-2"

            required

          />

        </label>

        <label>Precio promocional

          <input

            type="number"

            value={precioPromocional}

            onChange={(e) => setPrecioPromocional(e.target.value)}

            className="border rounded p-2 col-span-2"

          />

        </label>

      </section>

      {/* DIMENSIONES */}

      <section className="grid grid-cols-4 gap-3">

        <label className="flex flex-col text-sm gap-1">

          Peso (kg)

          <input

            placeholder="0.16"

            value={peso}

            onChange={(e) => setPeso(e.target.value)}

            className="border rounded h-10 px-2 text-center"

          />

        </label>


        <label className="flex flex-col text-sm gap-1">

          Profundidad (cm)

          <input

            placeholder="30"

            value={profundidad}

            onChange={(e) => setProfundidad(e.target.value)}

            className="border rounded h-10 px-2 text-center"

          />

        </label>


        <label className="flex flex-col text-sm gap-1">

          Ancho (cm)

          <input

            placeholder="30"

            value={ancho}

            onChange={(e) => setAncho(e.target.value)}

            className="border rounded h-10 px-2 text-center"

          />

        </label>


        <label className="flex flex-col text-sm gap-1">

          Alto (cm)

          <input

            placeholder="30"

            value={alto}

            onChange={(e) => setAlto(e.target.value)}

            className="border rounded h-10 px-2 text-center"

          />

        </label>

      </section> 

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block text-sm font-medium mb-2">Descripción</label>
        <EditorDescripcion value={descripcion} onChange={setDescripcion} />
      </div>

      {/* SECCIONES */}
      <div>
        <p className="font-medium mb-2">Secciones donde aparecerá</p>
        <div className="flex flex-wrap gap-3">
          {secciones.map((s) => (
            <label key={s.id} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200">
              <input type="checkbox" checked={seccionesSeleccionadas.includes(s.id)} onChange={() => toggleSeccion(s.id)} />
              <span className="text-sm">{s.nombre}</span>
            </label>
          ))}
        </div>
      </div>

      {/* CATEGORÍAS (EL ÁRBOL) */}
      <div>
        <p className="font-medium mb-2">Categorías y Subcategorías (Selección múltiple)</p>
        <div className="border rounded-lg p-3 max-h-72 overflow-auto bg-white shadow-inner">
          <CategoriaTreeSelector
            categorias={categoriasData} // Pasamos los OBJETOS del árbol
            value={categoriasSeleccionadas} // Pasamos los IDs seleccionados
            onChange={setCategoriasSeleccionadas} // Actualizamos los IDs
          />
        </div>
      </div>

      {/* IMÁGENES */}
      <div>
        <p className="font-medium mb-2">Imágenes del producto</p>
        <div className="flex gap-3 flex-wrap">
            {previewUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24">
                <img src={url} className="w-full h-full object-cover rounded-lg border" />
                <button type="button" onClick={() => eliminarImagen(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors text-gray-400">
            <CameraIcon className="w-6 h-6" />
            <input type="file" multiple hidden onChange={handleImageChange} />
            </label>
        </div>
      </div>

      <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">
        Publicar producto
      </button>
    </form>
  );
}