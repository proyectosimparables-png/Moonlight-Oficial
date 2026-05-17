// services/userService.ts
import { apiRequest } from "@/lib/apiClient";
import { ExtendedUser } from "@/types/user";

// Interfaz para las funciones que actualizan y devuelven la dirección
export interface RespuestaDireccion {
  success: boolean;
  message?: string;
  address: string;
}

// ==========================================
// Funciones de Perfil y Listado
// ==========================================

export async function getUserProfile(): Promise<ExtendedUser> {
  return await apiRequest<ExtendedUser>("/auth/protected");
}

export async function getAllUsers(): Promise<ExtendedUser[]> {
  try {
    return await apiRequest<ExtendedUser[]>("/auth/usuarios");
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
}

// ==========================================
// Funciones de Domicilio / Dirección
// ==========================================

export async function updateUserAddress(address: string): Promise<RespuestaDireccion> {
  return await apiRequest<RespuestaDireccion>("/auth/local/update-address", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export async function editUserAddress(address: string): Promise<RespuestaDireccion> {
  try {
    return await apiRequest<RespuestaDireccion>("/auth/edit-address", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  } catch (error) {
    console.error("Error real del backend:", error);
    throw new Error("Error al editar domicilio");
  }

}