// services/productos-service.ts
import { apiRequest } from "@/lib/apiClient";
import { Producto, SeccionType, CategoriaType } from "@/types/products";

// ==========================================================================================
// 🔍 LECTURA DE PRODUCTOS (GETS PÚBLICOS Y ADMIN) - EJECUCIÓN PURA EN SERVIDOR ⚡
// ==========================================================================================

export async function getSecciones(): Promise<SeccionType[]> {
  try {
    return await apiRequest<SeccionType[]>("/productos/secciones");
  } catch {
    console.error("Error cargando secciones");
    return [];
  }
}

export async function getProductosPublicos(): Promise<Producto[]> {
  return await apiRequest<Producto[]>("/productos");
}

export async function getProductosAdmin(filters?: { seccionId?: string; categoriaId?: string }): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (filters?.seccionId) params.append("seccionId", filters.seccionId);
  if (filters?.categoriaId) params.append("categoriaId", filters.categoriaId);

  return await apiRequest<Producto[]>(`/productos/admin?${params.toString()}`);
}

export async function getProductoAdminById(id: string): Promise<Producto> {
  return await apiRequest<Producto>(`/productos/admin/${id}`);
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  if (!slug) return null;
  try {
    return await apiRequest<Producto>(`/productos/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function searchProductos(query: string): Promise<{ exactos: Producto[]; relacionados: Producto[] }> {
  if (!query.trim()) return { exactos: [], relacionados: [] };
  try {
    return await apiRequest<{ exactos: Producto[]; relacionados: Producto[] }>(
      `/productos/search?q=${encodeURIComponent(query)}`
    );
  } catch (err) {
    console.error("Error en searchProductos:", err);
    return { exactos: [], relacionados: [] };
  }
}

export async function getProductosPublicosFiltrados(filters?: { seccionId?: string; categoriaId?: string }): Promise<Producto[]> {
  const params = new URLSearchParams();
  if (filters?.seccionId) params.append("seccionId", filters.seccionId);
  if (filters?.categoriaId) params.append("categoriaId", filters.categoriaId);

  return await apiRequest<Producto[]>(`/productos?${params.toString()}`);
}

export async function getCategoriasTree(seccionId: string): Promise<CategoriaType[]> {
  try {
    return await apiRequest<CategoriaType[]>(`/productos/categorias?seccionId=${seccionId}`);
  } catch {
    console.error("Error cargando categorías desde el árbol");
    return [];
  }
}

export async function getCategoriasBySeccion(seccionId?: string): Promise<CategoriaType[]> {
  const endpoint = seccionId ? `/productos/categorias?seccionId=${seccionId}` : "/productos/categorias";
  return await apiRequest<CategoriaType[]>(endpoint);
}

export async function getAllCategorias(): Promise<CategoriaType[]> {
  return await apiRequest<CategoriaType[]>("/productos/categorias");
}

export async function getSeccionBySlug(slug: string): Promise<SeccionType | null> {
  if (!slug) return null;
  try {
    return await apiRequest<SeccionType>(`/productos/secciones/slug/${slug}`);
  } catch {
    return null;
  }
}