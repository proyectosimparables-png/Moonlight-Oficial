// frontend/src/components/DetailsProducts.tsx
"use client";

import Image from "next/image";
import Head from "next/head";
import Navbar from "@/components/navbar/Navbar";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { useProductDetails } from "@/services/useProductDetails";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { AddedToCartModal } from "@/components/cart/AddedToCartModal";

interface DetailsProductsProps {
  productId: string;
}

export default function DetailsProducts({ productId }: DetailsProductsProps) {
  const { product, loading, error } = useProductDetails(productId);
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false); // Para deshabilitar botones mientras agrega

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6">Error: {error}</p>;
  if (!product) return <p className="p-6">Producto no encontrado</p>;

  const mainImage = product.imagenUrl || product.imagenes?.[0] || null;
  const precio = formatPrice(product.precio);

  const handleAddToCart = async () => {
    setProcessing(true);
    try {
      await addItem(String(product.id), quantity);
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf5e5" }}>
      <Navbar />

      <Head>
        <title>{product.nombre} | Mi Tienda</title>
        <meta name="description" content={product.descripcion} />
      </Head>

      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* --------------------- IMAGEN --------------------- */}
        <div className="md:w-1/2 flex flex-col gap-4">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.nombre}
              width={400}
              height={400}
              className="rounded-lg shadow-md"
              style={{ border: "3px solid #d8c4fa" }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-300 flex items-center justify-center rounded">
              Sin imagen
            </div>
          )}
        </div>

        {/* --------------------- INFO --------------------- */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-purple-700">
            {product.nombre}
          </h1>
          <p className="text-2xl font-semibold text-green-700">{precio}</p>

          {/* --------------------- SELECTOR DE CANTIDAD --------------------- */}
          {product.stock && product.stock > 0 && (
            <QuantitySelector
              quantity={quantity}
              stock={product.stock}
              onChange={setQuantity}
              disabled={processing}
            />
          )}

          {/* --------------------- BOTÓN AGREGAR AL CARRITO --------------------- */}
          <button
            className={`mt-2 px-4 py-2 rounded text-white transition ${
              product.stock === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || processing}
          >
            {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
          </button>

          <hr className="border-purple-200 my-2" />
          <div>
            <h3 className="text-xl font-semibold text-purple-700">
              Descripción
            </h3>
            <p className="text-gray-700">{product.descripcion}</p>
          </div>
        </div>
      </div>

      {/* --------------------- MODAL AGREGADO --------------------- */}
      {lastAddedItem && <AddedToCartModal />}
    </div>
  );
}
