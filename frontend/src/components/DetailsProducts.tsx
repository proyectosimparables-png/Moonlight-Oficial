"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  imagenUrl?: string;
  imagenes?: string[];
  stock?: number;
  categoriaId?: string;
  seccionId?: string;
  published?: boolean;
}

interface DetailsProductsProps {
  productId: string;
}

export default function DetailsProducts({ productId }: DetailsProductsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/${productId}`
        );

        if (!res.ok) throw new Error("Producto no encontrado");

        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div>
      <h1>{product.nombre}</h1>
      {product.imagenUrl && (
        <img src={product.imagenUrl} alt={product.nombre} width={300} />
      )}
      <p>{product.descripcion}</p>
      <p>Precio: {product.precio}</p>
      {product.stock !== undefined && <p>Stock: {product.stock}</p>}
      {/* Puedes renderizar más campos según necesites */}
    </div>
  );
}
