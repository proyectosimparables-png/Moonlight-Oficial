// src/services/authService.ts
import { apiRequest } from "@/lib/apiClient";
import { UserAuthProfile } from "@/types/auth";

/**
 * Inicia sesión con email y contraseña
 */
export async function loginLocal(email: string, password: string): Promise<boolean> {
  await apiRequest<void>("/auth/local/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return true;
}

/**
 * Registra un nuevo usuario en la plataforma
 */
export async function registerLocal(name: string, email: string, password: string, address: string): Promise<boolean> {
  await apiRequest<void>("/auth/local/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, address }),
  });
  return true;
}

/**
 * Obtiene el perfil del usuario autenticado a través de las cookies de sesión
 */
export async function getLocalUser(): Promise<UserAuthProfile | null> {
  try {
    return await apiRequest<UserAuthProfile>("/auth/local/me");
  } catch {
    return null; // Si no hay sesión o da error, retornamos null silenciosamente
  }
}

/**
 * Verifica el correo del usuario mediante el código numérico de 6 dígitos
 */
export async function verifyEmailLocal(code: string): Promise<boolean> {
  await apiRequest<void>("/auth/local/verify-email", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  return true;
}

/**
 * Reenvía el código de verificación al email del usuario en sesión
 */
export async function resendCodeLocal(): Promise<boolean> {
  await apiRequest<void>("/auth/local/resend-verification", {
    method: "POST",
  });
  return true;
}