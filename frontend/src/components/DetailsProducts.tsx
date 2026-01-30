"use client";

import Image from "next/image";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { useProductDetails } from "@/services/useProductDetails";
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
  initialProduct,
}: DetailsProductsProps) {
  const product = initialProduct;
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

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

  const formatPriceClean = (value: string | number | null | undefined): string => {
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

  if (error && !product) return <p className="p-6">Error: {error}</p>;
  if (!product) return <p className="p-6">Producto no encontrado</p>;

  const allImages: string[] = [
    ...(product.imagenUrl ? [product.imagenUrl] : []),
    ...(Array.isArray(product.imagenes) ? product.imagenes : []),
  ].filter((url, index, self): url is string =>
    Boolean(url) && typeof url === "string" && self.indexOf(url) === index
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
    if (product.talles && product.talles.length > 0 && !selectedTalle) {
      return alert("Por favor, selecciona un talle");
    }
    if (product.colores && product.colores.length > 0 && !selectedColor) {
      return alert("Por favor, selecciona un color");
    }

    setProcessing(true);
    try {
      await addItem(String(product.id), quantity);
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
    } finally {
      setProcessing(false);
    }
  };
  const todasLasVariantesDeTalle = product.talles?.flatMap((talle: string) => {
    if (!product.cortes || product.cortes.length === 0) return [talle];
    return product.cortes.map((corte: string) => `${talle} (${corte})`);
  }) || [];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* SECCIÓN CARRUSEL */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex overflow-hidden rounded-2xl shadow-lg border-2 border-[#d8c4fa] bg-white pointer-events-none lg:pointer-events-auto"
              >
                {allImages.map((imgUrl, index) => (
                  <div key={index} className="min-w-full relative aspect-square">
                    <Image
                      src={imgUrl}
                      alt={product.nombre}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ))}
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

              <div className="flex justify-center gap-2 mt-4">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImage(i)}
                    className={`h-2 rounded-full transition-all ${activeIndex === i ? "w-6 bg-[#7b5ca2]" : "w-2 bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:flex flex-wrap gap-2">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => scrollToImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeIndex === index ? "border-[#7b5ca2] scale-105" : "border-transparent opacity-60"
                    }`}
                >
                  <Image src={imgUrl} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN INFO */}
          <div className="flex-1 max-w-xl">
            <nav className="text-sm text-gray-500 mb-2 font-medium">
              Producto / <span className="text-[#7b5ca2]">{product.nombre}</span>
            </nav>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#6c5b7b] mb-2 uppercase tracking-tight">
              {product.nombre}
            </h1>

            <p className="text-2xl lg:text-3xl font-semibold text-[#7b5ca2] mb-6">
              {formatPriceClean(product.precio)}
            </p>

            {/* --- SELECCIÓN DE TALLES (TODAS LAS COMBINACIONES) --- */}
            {todasLasVariantesDeTalle.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase tracking-wider">
                  Talle: <span className="text-[#7b5ca2] font-extrabold">{selectedTalle || "Seleccioná uno"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {todasLasVariantesDeTalle.map((variante, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedTalle(variante)}
                      className={`px-3 py-2 border-2 rounded-xl text-xs font-bold transition-all ${selectedTalle === variante
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

            {/* --- SECCIÓN DE PRECIOS Y PAGOS --- */}
            <div className="flex flex-col gap-1 mb-6">
              {/* Precio Principal */}
              <h2 className="text-3xl font-bold text-[#6c5b7b]">
                {formatPriceClean(product.precio)}
              </h2>

              {/* Precio con Descuento Transferencia */}
              <div className="flex items-center gap-2">
                <span className="text-green-800 font-bold text-lg">
                  {formatPriceClean(Number(product.precio) * 0.9)}
                </span>
                <span className="text-gray-600 text-sm">
                  con <strong>Transferencia Bancaria o Depósito</strong> 💜
                </span>
              </div>
            </div>

            {/* --- BLOQUE DE CUOTAS Y BENEFICIOS --- */}
            <div className="flex flex-col gap-4 mb-8">

              {/* Banner Cuotas Débito */}
              <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 p-2 rounded-lg w-fit">
                <div className="bg-[#e91e63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  GO
                </div>
                <p className="text-[#e91e63] text-sm font-bold">
                  Cuotas SIN interés con <span className="underline">DÉBITO</span>
                </p>
                <div className="bg-[#e91e63] rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">
                  i
                </div>
              </div>

              {/* Detalle de Cuotas */}
              <div className="text-gray-500 text-sm">
                <p>
                  <span className="text-green-800 font-medium">3</span> cuotas <strong>sin interés</strong> de
                  <span className="font-bold ml-1">
                    {formatPriceClean(Number(product.precio) / 3)}
                  </span>
                </p>
              </div>

              {/* Texto Descuento Adicional */}
              <div className="text-sm">
                <p className="text-green-800 font-medium">
                  10% de descuento <span className="text-gray-600">pagando con Transferencia Bancaria o Depósito 💜</span>
                </p>
              </div>

            </div>

            {/* --- SELECCIÓN DE COLORES --- */}
            {product.colores && product.colores.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase tracking-wider">
                  Color: <span className="capitalize text-[#7b5ca2] font-extrabold">{selectedColor || "Seleccioná uno"}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colores.map((color: string) => {
                    const colorHex = COLOR_MAP[color.toLowerCase()] || "#eeeeee";
                    const isWhite = color.toLowerCase() === "blanco" || color.toLowerCase() === "crema";
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center relative ${selectedColor === color
                          ? "border-[#7b5ca2] scale-110 shadow-lg"
                          : "border-gray-200 hover:border-[#d8c4fa]"
                          }`}
                        style={{ backgroundColor: colorHex }}
                      >
                        {selectedColor === color && (
                          <div className={`w-2 h-2 rounded-full ${isWhite ? "bg-black" : "bg-white shadow"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white/60 backdrop-blur-sm p-4 lg:p-6 rounded-3xl border border-purple-100 shadow-sm mb-8">
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
                    className={`w-full py-3 lg:py-4 px-2 rounded-2xl font-bold text-sm lg:text-lg uppercase tracking-widest transition-all shadow-lg ${processing
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