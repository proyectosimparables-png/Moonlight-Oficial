'use server';
import { revalidatePath } from 'next/cache';

export async function createProducto(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/upload-producto`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Error creando producto');

  revalidatePath('/admin/productos');
  return await res.json();
}

export async function publicarProducto(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/publicar`, {
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Error al publicar producto');
  return res.json();
}

export async function deleteProducto(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Error al eliminar el producto');
  return res.json();
}


export async function removeImagenProducto(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/remover-imagen`, {
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Error eliminando imagen del producto');
  return res.json();
}

// Actualizar producto sin imagen
export async function updateProducto(id: string, data: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Error actualizando producto');
  return res.json();
}

export async function updateProductoConImagen(id: string, formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/upload`, {
    method: 'PUT',
    body: formData,
  });

  if (!res.ok) throw new Error('Error actualizando producto con imagen');
  return res.json();
}




//Todos los gets
export async function getSecciones() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`);
  console.log('Fetch secciones response:', res);
  if (!res.ok) throw new Error('Error cargando secciones');
  return res.json();
}

export async function getCategorias(seccionId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias?seccionId=${seccionId}`);
  if (!res.ok) throw new Error('Error cargando categorías');
  return res.json();
}


export async function getTiposPrenda() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/tipo-prenda`);

  if (!res.ok) throw new Error('Error cargando tipos de prenda');
  return res.json();
}

//tipos de prenda para el admin
export async function eliminarTipoPrenda(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/tipo-prenda/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error eliminando tipo de prenda");
  return res.json();
}

export async function actualizarTipoPrenda(
  id: string,
  data: { nombre?: string }
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/tipo-prenda/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error actualizando tipo de prenda");
  return res.json();
}


export async function getProductos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
  if (!res.ok) throw new Error('Error cargando productos');
  return res.json();
}


//categorias con sus productos para el admin
export async function getCategoriasBySeccion() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`);
   console.log('categories:', res);
  if (!res.ok) {
    throw new Error('Error cargando categorías');
  }
  return res.json();
}


// Eliminar una categoría
export async function eliminarCategoria(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Error eliminando categoría');
  return res.json();
}

// Editar / actualizar una categoría
export async function actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Error actualizando categoría');
  return res.json();
}