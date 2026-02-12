"use client";

import Image from "next/image";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useRef } from "react";
import { AddedToCartModal } from "@/components/cart/AddedToCartModal";
import { Producto } from "@/types/types-productos";
import { COLOR_MAP } from "@/lib/colores";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DetailsProductsProps {
  initialProduct: Producto;
}

export default function DetailsProducts({
  initialProduct: product, // Renombrado directamente para simplicidad
}: DetailsProductsProps) {
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // 1. FORMATEADOR DE PRECIOS ROBUSTO
  // Maneja: "1500.00", "$ 1.500", 1500 o null
  const formatPriceClean = (
    value: string | number | null | undefined,
  ): string => {
    if (value === null || value === undefined) return "$ 0";

    let numericValue: number;
    if (typeof value === "string") {
      // Limpia puntos, símbolos y toma la parte entera antes de la coma
      const cleanString = value
        .replace(/\./g, "")
        .replace(/\$/g, "")
        .split(",")[0]
        .trim();
      numericValue = parseInt(cleanString, 10);
    } else {
      numericValue = value;
    }

    if (isNaN(numericValue)) return "$ 0";

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  // 2. GESTIÓN DE IMÁGENES (Evita duplicados y limpia URLs)
  const allImages: string[] = [
    ...(product.imagenUrl ? [product.imagenUrl] : []),
    ...(Array.isArray(product.imagenes) ? product.imagenes : []),
  ].filter(
    (url, index, self): url is string =>
      Boolean(url) && typeof url === "string" && self.indexOf(url) === index,
  );

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: width * index,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const handleAddToCart = async () => {
    if (product.talles?.length && !selectedTalle) {
      return alert("Por favor, selecciona un talle");
    }
    if (product.colores?.length && !selectedColor) {
      return alert("Por favor, selecciona un color");
    }

    setProcessing(true);
    try {
      // Pasamos el ID y la cantidad, pero también podrías pasar talle/color si tu carrito lo soporta
      await addItem(String(product.id), quantity);
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
    } finally {
      setProcessing(false);
    }
  };

  // 3. GENERACIÓN DE VARIANTES DE TALLE + CORTE
  const todasLasVariantesDeTalle =
    product.talles?.flatMap((talle: string) => {
      if (!product.cortes || product.cortes.length === 0) return [talle];
      return product.cortes.map((corte: string) => `${talle} (${corte})`);
    }) || [];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* SECCIÓN VISUAL (IZQUIERDA) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex overflow-hidden rounded-2xl shadow-lg border-2 border-[#d8c4fa] bg-white lg:cursor-crosshair"
              >
                {allImages.length > 0 ? (
                  allImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="min-w-full relative aspect-square"
                    >
                      <Image
                        src={imgUrl}
                        alt={product.nombre}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  ))
                ) : (
                  <div className="min-w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">Sin imagen disponible</p>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => scrollToImage(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10 disabled:opacity-30 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="text-[#6c5b7b] h-6 w-6" />
                  </button>
                  <button
                    onClick={() => scrollToImage(activeIndex + 1)}
                    disabled={activeIndex === allImages.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10 disabled:opacity-30 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="text-[#6c5b7b] h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas (Desktop) */}
            <div className="hidden lg:flex flex-wrap gap-2">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => scrollToImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeIndex === index
                      ? "border-[#7b5ca2] scale-105"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt="thumb"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN INFO (DERECHA) */}
          <div className="flex-1 max-w-xl">
            {/* Breadcrumbs dinámicos */}
            <nav className="text-sm text-gray-500 mb-2 font-medium">
              {product.categoria?.nombre || "Producto"} /{" "}
              <span className="text-[#7b5ca2]">{product.nombre}</span>
            </nav>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#6c5b7b] mb-2 uppercase tracking-tight">
              {product.nombre}
            </h1>

            {/* Precios y Beneficios */}
            <div className="flex flex-col gap-1 mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#7b5ca2]">
                {formatPriceClean(product.precio)}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-green-800 font-bold text-lg">
                  {formatPriceClean(
                    Number(product.precio.toString().replace(/[^0-9]/g, "")) *
                      0.9,
                  )}
                </span>
                <span className="text-gray-600 text-sm">
                  pagando con <strong>Transferencia</strong> 💜
                </span>
              </div>
            </div>

            {/* Cuotas */}
            <div className="bg-pink-50 border border-pink-100 p-3 rounded-2xl mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#e91e63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  GO
                </div>
                <p className="text-[#e91e63] text-sm font-bold">
                  Cuotas SIN interés con DÉBITO
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                3 cuotas sin interés de{" "}
                <strong>
                  {formatPriceClean(
                    Number(product.precio.toString().replace(/[^0-9]/g, "")) /
                      3,
                  )}
                </strong>
              </p>
            </div>

            {/* Selección de Talle */}
            {todasLasVariantesDeTalle.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase tracking-wider">
                  Talle:{" "}
                  <span className="text-[#7b5ca2] font-extrabold">
                    {selectedTalle || "Seleccioná uno"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {todasLasVariantesDeTalle.map((variante, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTalle(variante)}
                      className={`px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all ${
                        selectedTalle === variante
                          ? "border-[#7b5ca2] bg-[#7b5ca2] text-white shadow-md scale-105"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#d8c4fa]"
                      }`}
                    >
                      {variante}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selección de Color */}
            {product.colores && product.colores.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase tracking-wider">
                  Color:{" "}
                  <span className="capitalize text-[#7b5ca2] font-extrabold">
                    {selectedColor || "Seleccioná uno"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colores.map((color) => {
                    const colorHex =
                      COLOR_MAP[color.toLowerCase()] || "#eeeeee";
                    const isWhite = ["blanco", "crema", "white"].includes(
                      color.toLowerCase(),
                    );
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                          selectedColor === color
                            ? "border-[#7b5ca2] scale-110 shadow-lg"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: colorHex }}
                      >
                        {selectedColor === color && (
                          <div
                            className={`w-2 h-2 rounded-full ${isWhite ? "bg-black" : "bg-white shadow"}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acciones de Compra */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-sm mb-8">
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

            {/* Descripción */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#6c5b7b] border-b-2 border-purple-100 pb-2 uppercase tracking-widest">
                Descripción
              </h3>
              <div
                className="prose prose-purple text-gray-700 leading-relaxed text-sm lg:text-base"
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
