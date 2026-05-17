// src/services/admin/admin-dashboard-service.ts
import { apiRequest } from "@/lib/apiClient";
import { ResumenGeneralResponse } from "@/types/dashboard";

// ✨ Ahora solo necesitas esta única función porque el backend te resuelve todo junto
export async function fetchResumenGeneral(): Promise<ResumenGeneralResponse> {
  return await apiRequest<ResumenGeneralResponse>("/dashboard/resumen");
}