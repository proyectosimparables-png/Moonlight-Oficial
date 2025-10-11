'use client';

import { useState } from 'react';
import { updateProducto, updateProductoConImagen, removeImagenProducto } from '@/services/productos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EditarProductoForm({ producto, onCancel, onUpdate }: any) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion);
  const [precio, setPrecio] = useState(producto.precio);
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(producto.imagenUrl);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImagen = async () => {
    try {
      await removeImagenProducto(producto.id);
      setImagenUrl(null);
      alert("✅ Imagen eliminada");
    } catch (error) {
      alert("❌ Error al eliminar imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (imagen) {
        const formData = new FormData();
        formData.append('file', imagen);
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', String(precio));
        formData.append('stock', String(producto.stock));
        formData.append('categoriaId', producto.categoriaId);
        formData.append('tipoPrendaId', producto.tipoPrendaId);

        await updateProductoConImagen(producto.id, formData);
      } else {
        await updateProducto(producto.id, {
          nombre,
          descripcion,
          precio,
          stock: producto.stock,
          categoriaId: producto.categoriaId,
          tipoPrendaId: producto.tipoPrendaId,
        });
      }

      alert("✅ Producto actualizado");
      onUpdate();
    } catch (error) {
      alert("❌ Error actualizando producto");
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
          <Input type="number" value={precio} onChange={(e) => setPrecio(parseFloat(e.target.value))} required />
        </div>
      </div>

      <div>
        <label className="block mb-1">Descripción</label>
        <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>

      {imagenUrl && (
        <div>
          <label className="block mb-1">Imagen actual</label>
          <img src={imagenUrl} alt="Imagen actual" className="h-32 object-cover rounded" />
          <Button type="button" variant="destructive" className="mt-2" onClick={handleRemoveImagen}>
            Eliminar imagen
          </Button>
        </div>
      )}

      <div>
        <label className="block mb-1">Nueva imagen</label>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        {previewUrl && (
          <img src={previewUrl} alt="Vista previa" className="mt-2 h-32 object-cover rounded" />
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-purple-600 text-white">Guardar cambios</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
