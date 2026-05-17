// src/lib/apiClient.ts
import { getVipCode } from "@/utils/utils";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_BASE_URL = RAW_API_URL.endsWith("/") ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

let mantenimientoActivoEnBaseDeDatos = false;
let codigoMantenimientoActual = "";
let ultimaValidacion = 0;

async function verificarMantenimientoReal() {
    const AHORA = Date.now();
    // Mantenemos la validación cada 30 segundos
    if (AHORA - ultimaValidacion > 30000) {
        try {
            // 🌟 CLAVE: Usamos 'omit' para que esta verificación de fondo no toque ni ensucie tus cookies de Admin
            const res = await fetch(`${API_BASE_URL}/configuracion-tienda/publico`, {
                credentials: 'omit'
            });
            if (res.ok) {
                const config = await res.json();
                mantenimientoActivoEnBaseDeDatos = config.mantenimientoActivo;
                codigoMantenimientoActual = config.mantenimientoCodigo;
            }
        } catch (error) {
            console.error("No se pudo verificar el estado de mantenimiento:", error);
        }
        ultimaValidacion = AHORA;
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    if (!endpoint.includes("/configuracion-tienda/publico")) {
        await verificarMantenimientoReal();
    }

    const headers = new Headers(options.headers);

    // 🌟 LA CORRECCIÓN CLAVE:
    // Solo seteamos "application/json" si el body NO es una instancia de FormData.
    // Si viene un FormData (con imágenes), NO ponemos Content-Type para que el navegador
    // configure de manera automática el 'multipart/form-data' junto con su boundary (------form).
    if (options.body && !(options.body instanceof FormData)) {
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
    } else if (!options.body) {
        // Para peticiones GET o DELETE comunes que no llevan body, también es seguro dejarlo o no ponerlo
        headers.set("Content-Type", "application/json");
    }

    if (mantenimientoActivoEnBaseDeDatos) {
        const vipCode = getVipCode();
        if (vipCode && vipCode === codigoMantenimientoActual) {
            headers.set("x-maintenance-code", vipCode);
        }
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const finalUrl = `${API_BASE_URL}${cleanEndpoint}`;

    // Forzamos explícitamente que las opciones incluyan siempre las credenciales
    const fetchOptions: RequestInit = {
        credentials: "include", // Asegura que el backend SIEMPRE reciba la cookie de sesión
        ...options,
        headers, // Pasamos nuestros headers corregidos
    };

    const res = await fetch(finalUrl, fetchOptions);

    if (!res.ok) {
        if (
            res.status === 503 &&
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/mantenimiento") &&
            !window.location.pathname.startsWith("/admin")
        ) {
            window.location.href = "/mantenimiento";
        }
        const errorText = await res.text();
        throw new Error(errorText || `Error ${res.status}`);
    }

    return res.json();
}