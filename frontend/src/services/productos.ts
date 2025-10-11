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
export async function updateProducto(id: string, data: any) {
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



export async function getProductos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
  if (!res.ok) throw new Error('Error cargando productos');
  return res.json();
}

export async function getCategoriasConProductos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`);
  if (!res.ok) throw new Error('Error cargando categorías con productos');
  return res.json();
}


