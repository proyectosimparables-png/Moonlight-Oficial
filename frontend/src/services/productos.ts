"use server";

import { Producto } from "@/types/types-productos";



// ✅ Actualizar producto flexible (con o sin imagen)
export async function updateProductoFlexible(id: string, data: any) {
  // CASO A: Hay imágenes nuevas (FormData)
  if (data.imagenes && data.imagenes.length > 0) {
    const formData = new FormData();
    formData.append("nombre", data.nombre);
    formData.append("descripcion", data.descripcion || "");
    formData.append("precio", String(data.precio));
    formData.append("stock", String(data.stock));

    // Solo adjuntar si existe y es string
    if (data.categoriaId && typeof data.categoriaId === "string") {
      formData.append("categoriaId", data.categoriaId);
    }

    if (data.seccionesIds && Array.isArray(data.seccionesIds)) {
      data.seccionesIds.forEach((sId: string) => {
        formData.append("seccionesIds", sId);
      });
    }

    data.imagenes.forEach((file: File) => {
      formData.append("files", file);
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/upload`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // CASO B: JSON puro (Sin imágenes)
  const { imagenes, ...rest } = data;

  // 🛡️ LIMPIEZA DINÁMICA: Eliminamos cualquier propiedad que sea null o undefined
  const cleanData = Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v != null)
  );

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}
export async function createProducto(formData: FormData) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/upload-producto`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    },
  );

  const text = await res.text();
  console.log("RESPUESTA BACKEND:", res.status, text);

  if (!res.ok) throw new Error(`Error creando producto: ${text}`);
  return JSON.parse(text);
}

export async function publicarProducto(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/publicar`,
    {
      method: "PUT",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Error al publicar producto");
  return res.json();
}

export async function deleteProducto(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al eliminar el producto: ${text}`);
  }

  return res.json();
}


export async function removeImagenProducto(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/${id}/remover-imagen`,
    {
      method: "PUT",
    },
  );

  if (!res.ok) throw new Error("Error eliminando imagen del producto");
  return res.json();
}



//Todos los gets
export async function getSecciones() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`,
  );

  if (!res.ok) throw new Error("Error cargando secciones");

  const text = await res.text();
  if (!text) {
    console.error("Respuesta vacía del backend");
    return [];
  }

  const data = JSON.parse(text);
  console.log("Fetch secciones data:", data);

  return data;
}
/////////////Para publico//////////////////////////////////////////////////////
export async function getProductosPublicos() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Error cargando productos públicos");
  return res.json();
}


////////////////Para admin/////////////////////////////////////////////////////
export async function getProductosAdmin(
  filters?: { seccionId?: string; categoriaId?: string }
) {
  const params = new URLSearchParams();

  if (filters?.seccionId) params.append("seccionId", filters.seccionId);
  if (filters?.categoriaId) params.append("categoriaId", filters.categoriaId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/admin?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Error cargando productos admin");
  return res.json();
}



//////////////producto individual///////////////////////////////////////////////////
export async function getProductoAdminById(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/admin/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}



//Categorias en arbol para el formulario//////////////////////////////////////////////////////////////////////////////
export async function getCategoriasTree(seccionId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/tree/por-seccion/${seccionId}`);

  if (res.status === 404) return []; // Si no hay nada, devolvemos array vacío en vez de tirar error
  if (!res.ok) throw new Error("Error cargando categorías");

  return res.json();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



export async function getCategorias(seccionId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias?seccionId=${seccionId}`,
  );
  if (!res.ok) throw new Error("Error cargando categorías");
  return res.json();
}

export async function getProductos() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos`);
  if (!res.ok) throw new Error("Error cargando productos");
  return res.json();
}



/**
 * Busca productos por nombre o descripción
 */
export async function searchProductos(query: string): Promise<Producto[]> {
  console.log("searchProductos llamado con query:", query);
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/productos/search?q=${encodeURIComponent(query)}`
    );
    console.log("Respuesta del fetch:", res.status);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error buscando productos: ${text}`);
    }

    const text = await res.text();
    console.log("Texto recibido del backend:", text);
    const data: Producto[] = text ? JSON.parse(text) : [];
    return data;
  } catch (err) {
    console.error("Error en searchProductos:", err);

    return [];
  }
}

//categorias con sus productos para el admin
export async function getCategoriasBySeccion(seccionId?: string) {
  // Si seccionId existe, agrega el query param; si no, llama al endpoint sin filtro
  const url = seccionId
    ? `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias?seccionId=${seccionId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Error cargando categorías");
  }

  return res.json();
}

// PUBLICO con filtros
export async function getProductosPublicosFiltrados(
  filters?: { seccionId?: string; categoriaId?: string }
) {
  const params = new URLSearchParams();

  if (filters?.seccionId) params.append("seccionId", filters.seccionId);
  if (filters?.categoriaId) params.append("categoriaId", filters.categoriaId);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Error cargando productos públicos");
  return res.json();
}



// Eliminar una categoría
export async function eliminarCategoria(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) throw new Error("Error eliminando categoría");
  return res.json();
}

export async function actualizarCategoria(
  id: string,
  data: { nombre?: string; seccionId?: string },
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Respuesta error backend:", errText);
    throw new Error("Error actualizando categoría");
  }

  return res.json();
}

//Crear categorías (adaptado para enviar el nombre de la sección)
export async function crearCategoria(data: {
  nombre: string;
  seccionNombre: string;
  parentId?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/productos/categorias`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error("Error al crear categoría");
  return res.json();
}






// Crear una sección
export async function crearSeccion(data: { nombre: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error creando sección: ${errorText}`);
  }

  return await res.json();
}

// Actualizar una sección
export async function actualizarSeccion(id: string, data: { nombre: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/secciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error actualizando sección: ${errorText}`);
  }

  return await res.json();
}

// Eliminar una sección
export async function eliminarSeccion(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/secciones/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error eliminando sección: ${errorText}`);
  }

  return await res.json();
}



