// frontend/src/services/useProductDetails.ts
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Producto } from "@/types/products";

export const useProductDetails = (productId: string) => {
    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                // Reemplazamos el fetch nativo por el cliente inteligente y tipado
                const data = await apiRequest<Producto>(`/productos/${productId}`);

                setProduct(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    return { product, loading, error };
};