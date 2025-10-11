'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createProducto, publicarProducto, getSecciones, getCategorias, getTiposPrenda } from '@/services/productos';
import { Producto } from '@/types/types-productos';

export default function FormProducto() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stock, setStock] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imagenSubidaUrl, setImagenSubidaUrl] = useState<string | null>(null);

  const [seccionIdSeleccionada, setSeccionIdSeleccionada] = useState('');
  const [categoriaIdSeleccionada, setCategoriaIdSeleccionada] = useState('');
  const [tipoPrendaIdSeleccionada, setTipoPrendaIdSeleccionada] = useState('');

  const [secciones, setSecciones] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Producto[]>([]);
  const [tiposPrenda, setTiposPrenda] = useState<Producto[]>([]);

  // 🔁 Cargar secciones y tipos
  useEffect(() => {
    async function cargarIniciales() {
      const [seccionesData, tiposPrendaData] = await Promise.all([
        getSecciones(),
        getTiposPrenda(),
      ]);
      setSecciones(seccionesData);
      setTiposPrenda(tiposPrendaData);
    }
    cargarIniciales();
  }, []);

  // 🔁 Cargar categorías
  useEffect(() => {
    if (!seccionIdSeleccionada) {
      setCategorias([]);
      setCategoriaIdSeleccionada('');
      return;
    }

    async function cargarCategorias() {
      const categoriasData = await getCategorias(seccionIdSeleccionada);
      setCategorias(categoriasData);
      setCategoriaIdSeleccionada('');
    }
    cargarCategorias();
  }, [seccionIdSeleccionada]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagen(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setStock('');
    setImagen(null);
    setPreviewUrl(null);
    setImagenSubidaUrl(null);
    setSeccionIdSeleccionada('');
    setCategoriaIdSeleccionada('');
    setTipoPrendaIdSeleccionada('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imagen) {
      toast.warning('⚠️ Selecciona una imagen');
      return;
    }

    const formData = new FormData();
    formData.append('file', imagen);
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', precio);
    formData.append('stock', stock);
    formData.append('categoriaId', categoriaIdSeleccionada);
    formData.append('tipoPrendaId', tipoPrendaIdSeleccionada);
    formData.append('seccionId', seccionIdSeleccionada);

    try {
      const productoCreado = await createProducto(formData);
      toast.success('✅ Producto creado correctamente');
      setImagenSubidaUrl(productoCreado.imagenUrl);

      await publicarProducto(productoCreado.id);
      toast('🚀 Producto publicado');

      resetForm(); // ✅ Vaciar el formulario

    } catch (error) {
      toast.error('❌ Error al crear producto');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <label>Nombre</label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <label>Precio</label>
      <input
        type="number"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <label>Stock</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <label>Descripción</label>
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <label>Sección</label>
      <select
        value={seccionIdSeleccionada}
        onChange={(e) => setSeccionIdSeleccionada(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      >
        <option value="">Selecciona una sección</option>
        {secciones.map((sec) => (
          <option key={sec.id} value={sec.id}>{sec.nombre}</option>
        ))}
      </select>

      <label>Categoría</label>
      <select
        value={categoriaIdSeleccionada}
        onChange={(e) => setCategoriaIdSeleccionada(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
        disabled={!seccionIdSeleccionada}
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>

      <label>Tipo de prenda</label>
      <select
        value={tipoPrendaIdSeleccionada}
        onChange={(e) => setTipoPrendaIdSeleccionada(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      >
        <option value="">Selecciona un tipo</option>
        {tiposPrenda.map((tipo) => (
          <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
        ))}
      </select>

      <label>Imagen</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full border px-3 py-2 rounded"
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

      <button
        type="submit"
        className="bg-[var(--color-purple)] text-white px-4 py-2 rounded hover:bg-[var(--color-light-purple)] transition"
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
