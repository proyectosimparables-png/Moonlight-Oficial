// src/services/promocionService.ts

// Definimos la estructura de la promoción para que TypeScript nos ayude
export interface Promocion {
    id: string;
    nombre: string;
    tipo: "CANTIDAD_X_CANTIDAD" | "PORCENTAJE" | "SEGUNDA_UNIDAD";
    valor: number;
    lleva?: number;
    paga?: number;
    productosIds: string[];
}

// Interfaz para los datos que enviamos al crear (sin el ID, porque lo genera el backend)
export interface CreatePromocionDTO {
    nombre: string;
    tipo: string;
    valor: number;
    productosIds: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Obtener todas las promociones
export async function getPromociones(): Promise<Promocion[]> {
    const res = await fetch(`${API_URL}/promociones`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error obteniendo promociones: ${text}`);
    }
    return res.json();
}

// 2. Crear una promoción
export async function createPromocion(data: CreatePromocionDTO): Promise<Promocion> {
    const res = await fetch(`${API_URL}/promociones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Error creando promoción: ${text}`);

    return JSON.parse(text);
}

// 3. Eliminar una promoción
export async function deletePromocion(id: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/promociones/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error eliminando promoción: ${text}`);
    }
    return true;
}