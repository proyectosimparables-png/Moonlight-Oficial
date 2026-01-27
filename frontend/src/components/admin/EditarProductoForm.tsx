"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { updateProductoFlexible, removeImagenProducto, getCategoriasTree } from "@/services/productos";
import { getSecciones } from "@/services/productos"; // Asumo que tienes este servicio
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoriaTreeSelector } from "@/components/CategoriaTreeSelector";
import toast from "react-hot-toast";
import { ImagePlus, Loader2 } from "lucide-react";
import type { Producto } from "@/types/types-productos";
import type { Categoria } from "@/types/Categorias";
import { COLOR_MAP, OPCIONES_COLORES, OPCIONES_CORTES, OPCIONES_TALLES } from "@/lib/colores";

interface EditarProductoFormProps {
  producto: Producto;
  onCancel: () => void;
  onUpdate: () => void;
}

export default function EditarProductoForm({ producto, onCancel, onUpdate }: EditarProductoFormProps) {
  // --- ESTADOS DE DATOS ---
  const [nombre, setNombre] = useState<string>(producto.nombre);
  const [descripcion, setDescripcion] = useState<string>(producto.descripcion || "");
  // Busca donde declaras el estado del precio y cámbialo por esto:
  const [precio, setPrecio] = useState<number>(() => {
    if (typeof producto.precio === 'number') return producto.precio;
    // Si viene como "$ 50.000", quitamos todo lo que no sea número
    const limpio = String(producto.precio).replace(/[^0-23456789]/g, '');
    return limpio ? Number(limpio) : 0;
  });
  const [stock, setStock] = useState<number>(producto.stock || 0);

  // --- ESTADOS DE RELACIONES ---
  const [seccionesLista, setSeccionesLista] = useState<any[]>([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState<string[]>(
    (producto as any).secciones?.map((s: any) => s.seccionId || s.id) || []
  );
  const [categoriasData, setCategoriasData] = useState<Categoria[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>(
    producto.categoria?.id ? [producto.categoria.id] : []
  );

  // --- ESTADOS DE IMÁGENES ---
  const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenUrlActual, setImagenUrlActual] = useState<string | null>(producto.imagenUrl || null);
  const [imagenesGaleria, setImagenesGaleria] = useState<any[]>(producto.imagenes || []);
  const [loading, setLoading] = useState(false);
  const [imagenesExistentes, setImagenesExistentes] = useState<any[]>(producto.imagenes || []);

  //colores y tallas//
  const [coloresSel, setColoresSel] = useState<string[]>(producto.colores || []);
  const [tallesSel, setTallesSel] = useState<string[]>(producto.talles || []);
  const [cortesSel, setCortesSel] = useState<string[]>(producto.cortes || []);

  // 1. Cargar todas las secciones disponibles al montar
  useEffect(() => {
    getSecciones().then(setSeccionesLista).catch(console.error);
  }, []);

  // 2. Cargar el árbol de categorías cuando cambie la sección seleccionada
  useEffect(() => {
    if (seccionesSeleccionadas.length > 0) {
      getCategoriasTree(seccionesSeleccionadas[0])
        .then(setCategoriasData)
        .catch((err) => {
          console.warn("Esta sección no tiene categorías aún");
          setCategoriasData([]); // Limpiamos el árbol en lugar de lanzar error
        });
    }
  }, [seccionesSeleccionadas]);
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setImagenesNuevas((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrls((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtenemos el último ID seleccionado del árbol
      const categoriaIdFinal = categoriasSeleccionadas.length > 0
        ? categoriasSeleccionadas[categoriasSeleccionadas.length - 1]
        : null;

      const data: any = {
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        colores: coloresSel,
        talles: tallesSel,
        cortes: cortesSel,
        seccionesIds: seccionesSeleccionadas.length > 0 ? seccionesSeleccionadas : undefined,
      };

      // VITAL: Solo agregamos categoriaId si realmente hay un valor string válido
      if (typeof categoriaIdFinal === "string" && categoriaIdFinal.trim() !== "") {
        data.categoriaId = categoriaIdFinal;
      }

      if (imagenesNuevas.length > 0) {
        data.imagenes = imagenesNuevas;
      }

      console.log("Objeto construido para el servicio:", data);

      await updateProductoFlexible(producto.id.toString(), data);
      toast.success("✅ Producto actualizado correctamente");
      onUpdate();
    } catch (error: any) {
      console.error(error);
      toast.error("❌ Error al actualizar");
    } finally {
      setLoading(false);
    }
  };
  const toggleSeccion = (id: string) => {
    setSeccionesSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id) // Si ya está, la quita
        : [...prev, id]                    // Si no está, la agrega
    );
  };

  const handleRemoveExistente = async (imagenId: string) => {
    try {
      setLoading(true);
      // Asumiendo que removeImagenProducto llama a un endpoint DELETE
      await removeImagenProducto(imagenId);
      setImagenesExistentes(prev => prev.filter(img => img.id !== imagenId));
      toast.success("Imagen eliminada");
    } catch (error) {
      toast.error("No se pudo eliminar la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm text-black">
      <h2 className="text-xl font-bold border-b pb-2">Editar Producto</h2>

      {/* Fila: Nombre y Precio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre</label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Precio</label>
          <Input
            type="number"
            step="0.01"
            value={precio === 0 ? "" : precio}
            onChange={(e) => {
              const val = e.target.value;
              setPrecio(val === "" ? 0 : parseFloat(val));
            }}
            placeholder="Ej: 50000"
            required
          />
        </div>
      </div>

      {/* Fila: Stock y Sección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Stock</label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Secciones donde aparecerá</label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
            {seccionesLista.map((sec) => {
              const isSelected = seccionesSeleccionadas.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => toggleSeccion(sec.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${isSelected
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-purple-400"
                    }`}
                >
                  {sec.nombre}
                  {isSelected ? " ✓" : " +"}
                </button>
              );
            })}
            {seccionesLista.length === 0 && (
              <span className="text-gray-400 text-xs">Cargando secciones...</span>
            )}
          </div>
        </div>
      </div>

      {/* Bloque: Categoría Tree */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <label className="block text-sm font-bold mb-3 text-purple-700">
          Categoría (Selecciona para corregir)
        </label>
        <div className="max-h-60 overflow-y-auto">
          <CategoriaTreeSelector
            categorias={categoriasData}
            value={categoriasSeleccionadas}
            onChange={setCategoriasSeleccionadas}
          />
        </div>
      </div>

      {/* Fila: Descripción */}
      <div className="space-y-1">
        <label className="block text-sm font-bold text-gray-700">Descripción del Producto</label>

        <div
          // Esta propiedad hace que el DIV se comporte como un Input/Textarea
          contentEditable={true}
          // Pasamos el HTML que ya tenemos
          dangerouslySetInnerHTML={{ __html: descripcion }}
          // Cuando el usuario escribe, guardamos el contenido en el estado
          onBlur={(e) => setDescripcion(e.currentTarget.innerHTML)}
          className="min-h-[150px] p-3 bg-white text-black border rounded-md overflow-auto focus:outline-none focus:ring-2 focus:ring-[#7b5ca2] break-words leading-relaxed 
               [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5"
        />
        <p className="text-[10px] text-gray-400">Haz clic sobre el texto para editarlo directamente.</p>
      </div>
      {/* Bloque: Imágenes con Preview */}
      <div className="space-y-4">
        <label className="block text-sm font-bold">Imágenes del Producto</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* 1. Imágenes Actuales (Galería guardada en DB) */}
          {imagenesGaleria.map((img) => (
            <div key={img.id} className="relative group border rounded-lg overflow-hidden h-32">
              <img src={img.url} className="h-full w-full object-cover" alt="Actual" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    try {
                      // Llama a tu servicio para eliminar de la DB
                      await removeImagenProducto(img.id);
                      // Filtra el estado para que desaparezca de la vista
                      setImagenesGaleria(prev => prev.filter(item => item.id !== img.id));
                      toast.success("Imagen quitada");
                    } catch (error) {
                      toast.error("Error al quitar imagen");
                    }
                  }}
                >
                  Quitar
                </Button>
              </div>
            </div>
          ))}

          {/* 2. Previews Nuevas (Las que estás subiendo ahora) */}
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group border rounded-lg overflow-hidden h-32">
              <img src={url} className="h-full w-full object-cover" alt="Preview" />
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                    setImagenesNuevas(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                >
                  X
                </button>
              </div>
            </div>
          ))}

          {/* 3. Botón Añadir */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:bg-gray-50 transition-colors">
            <ImagePlus className="w-8 h-8 text-gray-400" />
            <span className="text-[10px] text-gray-500 mt-1">Añadir más</span>
            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        </div>
      </div>

      {/* VARIANTES: COLORES, TALLES, CORTES */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-bold text-lg text-gray-700">Variantes de Prenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Selector de Colores */}
          <div>
            <p className="text-sm font-medium mb-2">Colores</p>
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {OPCIONES_COLORES.map((color) => (
                  <label key={color} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${coloresSel.includes(color) ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={coloresSel.includes(color)}
                      onChange={() => setColoresSel(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                    />
                    <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || "#eee" }} />
                    <span className={`text-sm ${coloresSel.includes(color) ? "font-bold text-purple-700" : "text-gray-600"}`}>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Talles (Repetir lógica similar para talles) */}
          <div>
            <p className="text-sm font-medium mb-2">Talles</p>
            <div className="border rounded-lg bg-white p-2 max-h-48 overflow-y-auto">
              {OPCIONES_TALLES.map((talle) => (
                <label key={talle} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    checked={tallesSel.includes(talle)}
                    onChange={() => setTallesSel(prev => prev.includes(talle) ? prev.filter(t => t !== talle) : [...prev, talle])}
                  />
                  <span className="text-sm">{talle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Selector de Cortes (Repetir lógica similar para cortes) */}
          <div>
            <p className="text-sm font-medium mb-2">Estilos</p>
            <div className="border rounded-lg bg-white p-2 max-h-48 overflow-y-auto">
              {OPCIONES_CORTES.map((corte) => (
                <label key={corte} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    checked={cortesSel.includes(corte)}
                    onChange={() => setCortesSel(prev => prev.includes(corte) ? prev.filter(c => c !== corte) : [...prev, corte])}
                  />
                  <span className="text-sm">{corte}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Cargando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </div>
    </form>
  );
}