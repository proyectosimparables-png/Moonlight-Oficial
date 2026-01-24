"use client";

import Image from "next/image";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { useProductDetails } from "@/services/useProductDetails";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { AddedToCartModal } from "@/components/cart/AddedToCartModal";
import { Producto } from "@/types/types-productos";

interface DetailsProductsProps {
  initialProduct: Producto;
}

export default function DetailsProducts({
  initialProduct,
}: DetailsProductsProps) {
  // Usamos el initialProduct directamente
  const product = initialProduct;
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Mantenemos el hook para que actualice datos en segundo plano si es necesario,
  // pero ignoramos su estado de "loading" inicial.
  const { error } = useProductDetails(String(product.id));

  useEffect(() => {
    if (product) {
      const initialImage =
        product.imagenUrl ||
        (product.imagenes && product.imagenes.length > 0
          ? product.imagenes[0].url
          : "");
      setSelectedImage(initialImage);
    }
  }, [product]);

  const formatPriceClean = (
    value: string | number | null | undefined,
  ): string => {
    if (!value) return "$ 0";

    let numericValue: number;

    if (typeof value === "string") {
      const baseValue = value.split(",")[0];
      numericValue = Number(baseValue.replace(/[^0-9]/g, ""));
    } else {
      numericValue = value;
    }

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  // ELIMINADO: if (loading) return ...
  // Ahora el componente renderiza directamente con initialProduct

  if (error && !product) return <p className="p-6">Error: {error}</p>;
  if (!product) return <p className="p-6">Producto no encontrado</p>;

  const allImages: string[] = [
    ...(product.imagenUrl ? [product.imagenUrl] : []),
    ...(product.imagenes?.map((img) => img.url) || []),
  ].filter(
    (url, index, self): url is string =>
      Boolean(url) && self.indexOf(url) === index,
  );

  const handleAddToCart = async (): Promise<void> => {
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
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-6 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
          {/* SECCIÓN IMÁGENES */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-[#d8c4fa]">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.nombre}
                  fill
                  priority
                  className="object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === imgUrl
                      ? "border-[#7b5ca2] scale-105"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Miniatura ${index}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN INFO */}
          <div className="flex-1 max-w-xl">
            <nav className="text-sm text-gray-500 mb-2 font-medium">
              Productos /{" "}
              <span className="text-[#7b5ca2]">{product.nombre}</span>
            </nav>

            <h1 className="text-4xl font-serif font-bold text-[#6c5b7b] mb-2 uppercase tracking-tight">
              {product.nombre}
            </h1>

            <p className="text-3xl font-semibold text-[#7b5ca2] mb-6">
              {formatPriceClean(product.precio)}
            </p>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-sm mb-8">
              <label className="block text-sm font-bold text-[#6c5b7b] mb-4 uppercase tracking-wider">
                Cantidad
              </label>
              {product.stock && product.stock > 0 ? (
                <div className="flex flex-col gap-5">
                  <QuantitySelector
                    quantity={quantity}
                    stock={product.stock}
                    onChange={setQuantity}
                    disabled={processing}
                  />
                  <button
                    className={`w-full py-4 rounded-2xl font-bold text-lg uppercase tracking-widest transition-all shadow-lg ${
                      processing
                        ? "bg-gray-400 cursor-wait"
                        : "bg-[#7b5ca2] hover:bg-[#665ca2] text-white"
                    }`}
                    onClick={handleAddToCart}
                    disabled={processing}
                  >
                    {processing ? "Agregando..." : "Agregar al carrito"}
                  </button>
                </div>
              ) : (
                <div className="py-4 px-6 bg-red-50 text-red-500 rounded-2xl font-bold text-center border border-red-100">
                  PRODUCTO AGOTADO
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#6c5b7b] border-b-2 border-purple-100 pb-2 uppercase tracking-widest">
                Descripción
              </h3>
              <div
                className="prose prose-purple text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descripcion }}
              />
            </div>
          </div>
        </div>
      </div>
      {lastAddedItem && <AddedToCartModal />}
    </div>
  );
}
