// src/types/envios.ts

// ==========================================================================================
// 🎛️ CONFIGURACIÓN DE ENVÍO GRATIS (Reglas de la Tienda)
// ==========================================================================================

export interface ConfigEnvio {
    id: string;
    montoMinimo: number;
    activo: boolean;
    updatedAt?: string;
}

// Tipo para el payload del PATCH
export interface UpdateConfigEnvioDTO {
    montoMinimo: number;
    activo: boolean;
}


// ==========================================================================================
// 📍 PUNTOS DE ENTREGA (Showrooms / Retiros Físicos)
// ==========================================================================================

export interface PuntoEntrega {
    id: string;
    nombre: string;
    direccion: string;
    localidad: string;
    provincia: string;
    indicaciones?: string | null;
    activo: boolean;
}

// Tipo para la creación y edición parcial
export type CreatePuntoEntregaDTO = Omit<PuntoEntrega, "id">;
export type UpdatePuntoEntregaDTO = Partial<CreatePuntoEntregaDTO>;

export interface CartItemInput {
    id?: string | number;
    productoId?: string;
    varianteId?: string;
    quantity: number;
    [key: string]: unknown; // Flexibilidad para otras propiedades del carrito (nombre, precio, etc.)
}

// ==========================================================================================
// 🚚 COTIZACIÓN DE CORREO (Tarifas en Tiempo Real)
// ==========================================================================================

export interface ShippingRateResult {
    servicio: string;        // Ej: "Clásico", "Expreso", "Retiro en Sucursal"
    costo: number;           // Ej: 4500
    plazoEntrega: string;    // Ej: "3 a 5 días hábiles"
}