// src/services/validar-cupon-promocion.ts

import { apiRequest } from "@/lib/apiClient";
import { CuponResponse } from "@/types/promociones";

export const promocionesService = {



    async validarCupon(codigo: string, montoCarrito: number): Promise<CuponResponse> {

        return await apiRequest<CuponResponse>(
            `/promociones/validar-cupon/${codigo.toUpperCase()}?montoCarrito=${montoCarrito}`,
            { cache: "no-store" }
        );
    }
};