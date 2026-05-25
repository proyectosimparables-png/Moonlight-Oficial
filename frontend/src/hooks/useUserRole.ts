"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/Auth-Context";

// Definimos los posibles roles para mejor tipado, si es necesario
type UserRole = string | null;

export function useUserRole(): { role: UserRole; loading: boolean } {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useUserRole debe usarse dentro de AuthProvider");
    }

    // 🚨 CORRECCIÓN: Destructuramos user y authLoaded del contexto
    const { user, isAuthenticated, authLoaded } = context;

    if (!authLoaded) {
        return { role: null, loading: true };
    }

    // 🚨 CORRECCIÓN: El rol se extrae del objeto 'user'
    // Si está autenticado, toma el rol del usuario (que puede ser null/undefined si la sincronización no lo encontró)
    // Si no está autenticado, asignamos "GUEST" o "CLIENTE"
    const userRole = user?.role || null;

    // Si no está autenticado, asumimos un rol por defecto. Si está autenticado, usamos el rol de la DB.
    const finalRole = isAuthenticated ? (userRole || "CLIENTE") : "GUEST";


    // NOTA: Si siempre quieres que un usuario logueado tenga al menos "CLIENTE"
    // Puedes usar: const finalRole = isAuthenticated ? (userRole || "CLIENTE") : "GUEST";
    // Como lo tenías, pero usando userRole.

    return { role: finalRole, loading: false };
}