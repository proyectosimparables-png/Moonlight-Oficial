//frontend/src/services/useProductDetails.ts

import { useState, useEffect } from "react";
import { Producto } from "@/types/types-productos";

export const useProductDetails = (productId: string) => {
    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/productos/${productId}`
                );
                console.log("ID recibido:", productId);
                console.log("Producto desde API:", product);
                if (!res.ok) throw new Error("Producto no encontrado");

                const data: Producto = await res.json();
                setProduct(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    return { product, loading, error };
};


