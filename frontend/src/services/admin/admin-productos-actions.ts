//services/admin/productos-actions.ts
"use server";

import { apiRequest } from "@/lib/apiClient";
import { Producto, CategoriaType, SeccionType, ProductoForm, ProductoBackend } from "@/types/productos";

// ==========================================================================================
// 📦 EXCLUSIVO: MUTACIONES Y ESCRITURA (SERVER ACTIONS REALES) 🛠️
// ==========================================================================================

export async function updateProductoFlexible(
    id: string,
    data: ProductoForm & { colores?: string[]; talles?: string[]; cortes?: string[]; stock?: number | string }
): Promise<Producto> {
    if (data.imagenes && data.imagenes.length > 0) {
        const formData = new FormData();
        formData.append("nombre", data.nombre);
        formData.append("descripcion", data.descripcion || "");
        formData.append("precio", String(data.precio));
        if (data.stock) formData.append("stock", String(data.stock));

        data.colores?.forEach((c: string) => formData.append("colores", c));
        data.talles?.forEach((t: string) => formData.append("talles", t));
        data.cortes?.forEach((cor: string) => formData.append("cortes", cor));

        if (data.categoriaId && typeof data.categoriaId === "string") {
            formData.append("categoriaId", data.categoriaId);
        }

        if (data.seccionIds && Array.isArray(data.seccionIds)) {
            data.seccionIds.forEach((sId: string) => {
                formData.append("seccionesIds", sId);
            });
        }

        data.imagenes.forEach((file: File | { url: string } | unknown) => {
            if (file instanceof File) {
                formData.append("files", file);
            } else if (file && typeof file === "object" && "url" in file) {
                formData.append("files", (file as { url: string }).url);
            } else {
                formData.append("files", String(file));
            }
        });

        return await apiRequest<Producto>(`/productos/${id}/upload`, {
            method: "PUT",
            body: formData,
        });
    }

    const cleanData = Object.fromEntries(
        Object.entries(data).filter(([key, v]) => key !== "imagenes" && v != null)
    );
    return await apiRequest<Producto>(`/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(cleanData),
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