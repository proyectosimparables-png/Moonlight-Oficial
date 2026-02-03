"use client";

import { useEffect, useState } from "react";
import {
  createProducto,
  publicarProducto,
  getSecciones,
  getCategorias,
  getCategoriasTree,
} from "@/services/productos";
import toast from "react-hot-toast";
import EditorDescripcion from "./EditorDescripcion";
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/solid";
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

  /*Colores y talles */
  const [coloresSel, setColoresSel] = useState<string[]>([]);
  const [cortesSel, setCortesSel] = useState<string[]>([]);
  const [tallesSel, setTallesSel] = useState<string[]>([]);


  //cargas
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    getSecciones().then(setSecciones).catch(console.error);
  }, []);

  useEffect(() => {
    // Solo disparar si tenemos un ID real y largo (típico de UUID o MongoDB ID)
    if (!seccionesSeleccionadas[0] || seccionesSeleccionadas[0].length < 10) {
      setCategoriasData([]);
      return;
    }

    getCategoriasTree(seccionesSeleccionadas[0])
      .then((data) => {
        if (data) setCategoriasData(data);
      })
      .catch((err) => {
        console.error("Error en el componente:", err);
        toast.error("No se pudieron cargar las categorías");
      });
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
   setLoading(true);
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
    coloresSel.forEach(c => formData.append("colores", c));
    tallesSel.forEach(t => formData.append("talles", t));
    cortesSel.forEach(cor => formData.append("cortes", cor));

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

  const OPCIONES_COLORES = ["blanco", "negro", "gris", "chocolate", "azul", "crema", "beige", "verde", "violeta", "lila"];
  const OPCIONES_CORTES = ["clásica", "oversize", "boxy fit", "musculosa oversize", "crop top"];
  const OPCIONES_TALLES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

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

      {/* VARIANTES: COLORES, TALLES, CORTES */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-bold text-lg text-gray-700">Variantes de Prenda</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Selector de Colores */}
          <div>
            <p className="text-sm font-medium mb-2">Colores disponibles</p>
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {OPCIONES_COLORES.map((color) => (
                  <label
                    key={color}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${coloresSel.includes(color) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={coloresSel.includes(color)}
                      onChange={() =>
                        setColoresSel((prev) =>
                          prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                        )
                      }
                    />
                    {/* Círculo de Color Dinámico */}
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || "#eee" }}
                    />
                    <span className={`text-sm capitalize ${coloresSel.includes(color) ? "font-bold text-purple-700" : "text-gray-600"}`}>
                      {color}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{coloresSel.length} seleccionados</p>
          </div>

          {/* Selector de Talles */}
          <div>
            <p className="text-sm font-medium mb-2">Talles disponibles</p>
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {OPCIONES_TALLES.map((talle) => (
                  <label
                    key={talle}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${tallesSel.includes(talle) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={tallesSel.includes(talle)}
                      onChange={() =>
                        setTallesSel((prev) =>
                          prev.includes(talle) ? prev.filter((t) => t !== talle) : [...prev, talle]
                        )
                      }
                    />
                    <div className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded border ${tallesSel.includes(talle) ? "bg-purple-600 text-white border-purple-600" : "bg-gray-100 text-gray-500"
                      }`}>
                      {talle}
                    </div>
                    <span className={`text-sm ${tallesSel.includes(talle) ? "font-bold text-purple-700" : "text-gray-600"}`}>
                      Talle {talle}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{tallesSel.length} seleccionados</p>
          </div>

          {/* Selector de Cortes */}
          <div>
            <p className="text-sm font-medium mb-2">Estilos / Cortes</p>
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {OPCIONES_CORTES.map((corte) => (
                  <label
                    key={corte}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${cortesSel.includes(corte) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={cortesSel.includes(corte)}
                      onChange={() =>
                        setCortesSel((prev) =>
                          prev.includes(corte) ? prev.filter((c) => c !== corte) : [...prev, corte]
                        )
                      }
                    />
                    <div className={`w-2 h-2 rounded-full ${cortesSel.includes(corte) ? "bg-purple-600" : "bg-gray-300"}`} />
                    <span className={`text-sm capitalize ${cortesSel.includes(corte) ? "font-bold text-purple-700" : "text-gray-600"}`}>
                      {corte}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{cortesSel.length} seleccionados</p>
          </div>

        </div>
      </div>
      <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95">
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Publicando producto...
          </span>
        ) : (
          "Publicar producto"
        )}
      </button>
    </form>
  );
}