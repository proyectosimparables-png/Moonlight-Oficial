// src/types/promociones.ts

export interface RelacionBase {
    id: string;
    nombre: string;
}

// --- SUB-MÓDULO: PROMOCIONES ---
export interface PromocionResponse {
    id: string;
    nombre: string;
    tipo: "DESCUENTO_PORCENTAJE" | "DESCUENTO_FIJO" | "COMPRA_X_LLEVA_Y" | string;
    valor: number;
    prioridad: number;
    activa: boolean;
    fechaInicio: string | null;
    fechaFin: string | null;
    createdAt: string;
    updatedAt: string;
    productos?: RelacionBase[];
    categorias?: RelacionBase[];
    secciones?: RelacionBase[];
}

export interface PromocionPayload {
    nombre: string;
    tipo: string;
    valor: number;
    prioridad: number;
    activa: boolean;
    fechaInicio?: string | null;
    fechaFin?: string | null;
    productosIds?: string[];
    categoriasIds?: string[];
    seccionesIds?: string[];
}

// --- SUB-MÓDULO: CUPONES ---
export interface CuponResponse {
    id: string;
    codigo: string;
    tipo: "PORCENTAJE" | "MONTO_FIJO" | "ENVIO_GRATIS" | "FIJO" | string; // 👈 Unificado con los del Form
    valor: number;
    minimoCarrito: number;
    limiteUso: number | null;
    usados: number;
    activo: boolean;
    acumulable?: boolean;        // 👈 Agregado para que no rompa el form
    soloPrimeraCompra?: boolean;  // 👈 Agregado para que no rompa el form
    fechaInicio?: string | null;
    fechaFin?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CuponPayload {
    id?: string;
    codigo: string;
    tipo: string;
    valor: number;
    minimoCarrito: number;
    limiteUso?: number | null;
    activo: boolean;
    acumulable?: boolean;        // 👈 Agregado
    soloPrimeraCompra?: boolean;  // 👈 Agregado
    fechaInicio?: string | null;
    fechaFin?: string | null;
}