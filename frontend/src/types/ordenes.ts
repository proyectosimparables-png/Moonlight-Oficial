// src/types/ordenes.ts

export interface OrderItem {
    productoId: string;
    cantidad: number;
}

export interface OrderPayload {
    userId: string;
    emailContacto: string;
    nombreDestinatario: string;
    apellidoDestinatario: string;
    dniDestinatario: string;
    telefonoDestinatario: string;
    metodoEnvio: string;
    productType?: string;
    deliveredType?: string;
    costoEnvio: number;
    codigoPostal: string;
    provincia: string;
    localidad: string;
    calle: string;
    numero: string;
    piso?: string;
    departamento?: string;
    metodoPago: string;
    notasEntrega?: string;
    cuponCodigo?: string;
    items: OrderItem[];
}

// 📦 LA POSTA: Interfaz unificada para todo el Panel de Administración
export interface OrderResponse {
    id: string;
    total: number;
    estado: string; // "PENDIENTE", "PAGADO", "EMPAQUETADO", "ENVIADO", "CANCELADO", etc.
    createdAt: string;
    updatedAt: string;
    metodoPago: string | null;
    metodoEnvio: string | null;
    costoEnvio: number;
    notasAdmin?: string;

    // Datos para el renderizado de la columna "Cliente"
    user: {
        name: string | null;
        email: string;
    };

    // Datos de entrega indispensables para el Admin
    emailContacto: string;
    nombreDestinatario: string;
    apellidoDestinatario: string;
    telefonoDestinatario?: string;
    provincia?: string;
    localidad?: string;
    calle?: string;
    numero?: string;

    // Ítems detallados populados por el backend de NestJS
    items: {
        id: string;
        nombre: string;
        precio: number;
        cantidad: number;
        imagenUrl: string; // Obligatoria para que <Image /> no chille
        colores?: string;
        talles?: string;
    }[];
}

export interface MPPreferenceResponse {
    id: string;
    init_point: string;
}

export interface GoCuotasResponse {
    url: string;
    [key: string]: unknown;
}

/* --- HISTORIAL DE USUARIO (YA COMPROBADO EN UI) --- */
export interface HistorialOrdenItem {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imagenUrl?: string;
}

export interface HistorialOrden {
    id: string;
    total: number;
    estado: string;
    createdAt: string;
    items: HistorialOrdenItem[];
}

export interface HistorialResponse {
    historial: HistorialOrden[];
    total: number;
    cantidad: number;
}