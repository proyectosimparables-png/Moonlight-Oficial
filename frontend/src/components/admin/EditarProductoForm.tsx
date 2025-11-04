"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { updateProductoFlexible, removeImagenProducto } from "@/services/productos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";

// Define la interfaz del producto
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
  imagenUrl?: string | null;
}

interface EditarProductoFormProps {
  producto: Producto;
  onCancel: () => void;
  onUpdate: () => void;
}

// Tipo para datos que se enviarán al update flexible
interface ProductoUpdateData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
  imagenes?: File[];
}

export default function EditarProductoForm({
  producto,
  onCancel,
  onUpdate,
}: EditarProductoFormProps) {
  const [nombre, setNombre] = useState<string>(producto.nombre);
  const [descripcion, setDescripcion] = useState<string>(producto.descripcion);
  const [precio, setPrecio] = useState<number>(producto.precio);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imagenUrl, setImagenUrl] = useState<string | null>(producto.imagenUrl || null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImagenes((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrls((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImagenPreview = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImagenActual = async () => {
    try {
      await removeImagenProducto(producto.id.toString());
      setImagenUrl(null);
      toast("✅ Imagen eliminada");
    } catch {
      toast.error("❌ Error al eliminar imagen");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Construimos los datos con tipo ProductoUpdateData
      const data: ProductoUpdateData = {
        nombre,
        descripcion,
        precio,
        stock: producto.stock,
        categoriaId: producto.categoriaId,
      };

      if (imagenes.length > 0) {
        data.imagenes = imagenes;
      }

      await updateProductoFlexible(producto.id.toString(), data);

      toast.success("✅ Producto actualizado");

      // Limpiar previews y archivos cargados
      setImagenes([]);
      setPreviewUrls([]);

      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("❌ Error actualizando producto");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Precio</label>
          <Input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(parseFloat(e.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <label className="block mb-1">Descripción</label>
        <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      {imagenUrl && (
        <div className="relative">
          <label className="block mb-1">Imagen actual</label>
          <img src={imagenUrl} alt="Imagen actual" className="h-32 object-cover rounded" />
          <Button type="button" variant="destructive" className="mt-2" onClick={handleRemoveImagenActual}>
            Eliminar imagen
          </Button>
        </div>
      )}

      <div>
        <label className="block mb-1">Agregar imágenes</label>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer p-4 border border-dashed rounded-lg text-gray-400 flex flex-col items-center justify-center hover:text-gray-600">
            <ImagePlus className="w-8 h-8 mb-1" />
            <span className="text-sm">Seleccionar imágenes</span>
            <Input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </label>

          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} alt={`Vista previa ${index + 1}`} className="h-32 w-32 object-cover rounded" />
              <button
                type="button"
                onClick={() => handleRemoveImagenPreview(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-purple-600 text-white">
          Guardar cambios
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
