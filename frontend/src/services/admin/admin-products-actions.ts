"use server";

import { apiRequest } from "@/lib/apiClient";
import { Producto, CategoriaType, SeccionType, ProductoBackend } from "@/types/products";

// ==========================================================================================
// 📦 EXCLUSIVO: MUTACIONES Y ESCRITURA (SERVER ACTIONS REALES) 🛠️
// ==========================================================================================

/**
 * Actualiza un producto de forma flexible utilizando FormData.
 * Esto permite enviar datos nativos, variantes en JSON y múltiples archivos físicos en la misma petición.
 */
export async function updateProductoFlexible(
    id: string,
    formData: FormData
): Promise<Producto> {
    // Mandamos el FormData limpio y directo al endpoint multi-part de tu backend
    return await apiRequest<Producto>(`/productos/${id}/upload`, {
        method: "PUT",
        body: formData, // Al pasar un FormData nativo, el runtime de Next.js/Vercel configura el Content-Type correcto automáticamente
    });
}

export async function createProducto(formData: FormData): Promise<Producto> {
    return await apiRequest<Producto>("/productos/upload-producto", {
        method: "POST",
        body: formData,
    });
}

export async function publicarProducto(id: string): Promise<Producto> {
    return await apiRequest<Producto>(`/productos/${id}/publicar`, {
        method: "PUT",
    });
}

export async function deleteProducto(id: string): Promise<{ success: boolean }> {
    return await apiRequest<{ success: boolean }>(`/productos/${id}`, {
        method: "DELETE",
    });
}

export async function removeImagenProducto(id: string): Promise<Producto> {
    return await apiRequest<Producto>(`/productos/${id}/remover-imagen`, {
        method: "PUT",
    });
}

export async function eliminarCategoria(id: string): Promise<{ success: boolean }> {
    return await apiRequest<{ success: boolean }>(`/productos/categorias/${id}`, {
        method: "DELETE",
    });
}

export async function actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string }): Promise<CategoriaType> {
    return await apiRequest<CategoriaType>(`/productos/categorias/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function crearCategoria(data: { nombre: string; seccionNombre: string; parentId?: string }): Promise<CategoriaType> {
    return await apiRequest<CategoriaType>("/productos/categorias", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function crearSeccion(data: { nombre: string }): Promise<SeccionType> {
    return await apiRequest<SeccionType>("/productos/secciones", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function actualizarSeccion(id: string, data: { nombre: string }): Promise<SeccionType> {
    return await apiRequest<SeccionType>(`/productos/secciones/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function eliminarSeccion(id: string): Promise<{ success: boolean }> {
    return await apiRequest<{ success: boolean }>(`/productos/secciones/${id}`, {
        method: "DELETE",
    });
}

export async function getProductosAdmin(): Promise<ProductoBackend[]> {
    return await apiRequest<ProductoBackend[]>("/productos/admin");
}