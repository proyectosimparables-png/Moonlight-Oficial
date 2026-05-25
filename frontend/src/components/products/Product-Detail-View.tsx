"use client";

import Image from "next/image";
import { QuantitySelector } from "@/components/cart/Quantity-Selector";
import { useCart } from "@/context/Cart-Context";
import { useState, useRef, useMemo, useEffect } from "react";
import { AddedToCartModal } from "@/components/cart/Added-To-Cart-Modal";
import { Producto } from "@/types/products";
import { COLOR_MAP } from "@/lib/colors";
import { ChevronLeft, ChevronRight, Info } from "lucide-react"; // Importamos Info para el icono de GOcuotas
import { toast } from "react-hot-toast";

interface DetailsProductsProps {
  initialProduct: Producto;
}

export default function DetailsProducts({
  initialProduct: product,
}: DetailsProductsProps) {
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // --- CÁLCULOS DE PRECIOS ---
  const precioNumerico = product.precio;

  const precioTransferencia = precioNumerico * 0.9; // 10% de descuento
  const valorCuotaGO = precioNumerico / 3; // 3 cuotas
  // 1. EXTRAER OPCIONES ÚNICAS
  const tallesDisponibles = useMemo(() => {
    const t = product.variantes
      ?.map((v) => v.talle)
      .filter((talle): talle is string => Boolean(talle));
    return [...new Set(t)];
  }, [product.variantes]);

  const coloresDisponibles = useMemo(() => {
    const c = product.variantes
      ?.map((v) => v.color)
      .filter((color): color is string => Boolean(color));
    return [...new Set(c)];
  }, [product.variantes]);

  // 2. LÓGICA DE VARIANTES Y STOCK
  const varianteSeleccionada = useMemo(() => {
    if (!product.variantes || !selectedTalle || !selectedColor) {
      return null;
    }

    return product.variantes.find(
      (v) =>
        v.talle?.trim().toLowerCase() === selectedTalle.trim().toLowerCase() &&
        v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase(),
    );
  }, [product.variantes, selectedTalle, selectedColor]);

  const stockDisponible = useMemo((): number => {
    if (!varianteSeleccionada) return 0;
    return varianteSeleccionada.stock === null
      ? 999
      : varianteSeleccionada.stock;
  }, [varianteSeleccionada]);

  useEffect(() => {
    if (quantity > stockDisponible && stockDisponible > 0) {
      setQuantity(stockDisponible);
    }
  }, [stockDisponible, quantity]);

  // 3. FORMATEADOR DE PRECIOS
  const formatPriceClean = (value: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const allImages: string[] = [
    ...(product.imagenUrl ? [product.imagenUrl] : []),
    ...(Array.isArray(product.imagenes) ? product.imagenes : []),
  ].filter((url): url is string => Boolean(url));

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: "smooth" });
      setActiveIndex(index);
    }
  };

  const handleAddToCart = async () => {
    if (tallesDisponibles.length > 0 && !selectedTalle) {
      toast.error("Por favor, seleccioná un talle", { icon: "📏" });
      return;
    }
    if (coloresDisponibles.length > 0 && !selectedColor) {
      toast.error("Por favor, seleccioná un color", { icon: "🎨" });
      return;
    }
    if (!varianteSeleccionada) {
      toast.error("Combinación no disponible");
      return;
    }

    setProcessing(true);
    try {
      await addItem(String(product.id), quantity, {
        nombre: product.nombre,
        talle: selectedTalle,
        color: selectedColor,
        varianteId: varianteSeleccionada.id,
        imagenUrl:
          product.imagenUrl || allImages[0] || "/images/placeholder.png",
        precio: product.precio,
      });
    } catch (err) {
      console.error("❌ Error al agregar:", err);
      toast.error("Error al agregar al carrito");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto p-4 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* GALERÍA */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative group">
              <div
                ref={scrollRef}
                className="flex overflow-hidden rounded-2xl shadow-lg border-2 border-[#d8c4fa] bg-white"
              >
                {allImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="min-w-full relative aspect-square"
                  >
                    <Image
                      src={imgUrl}
                      alt={product.nombre}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => scrollToImage(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full disabled:opacity-30 z-10"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => scrollToImage(activeIndex + 1)}
                    disabled={activeIndex === allImages.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full disabled:opacity-30 z-10"
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="flex-1 max-w-xl">
            <nav className="text-sm text-gray-500 mb-2 font-medium">
              {product.categoria?.nombre || "Producto"} /{" "}
              <span className="text-[#7b5ca2]">{product.nombre}</span>
            </nav>

            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#6c5b7b] mb-2 uppercase">
              {product.nombre}
            </h1>

            {/* SECCIÓN DE PRECIOS AJUSTADA SEGÚN IMAGEN */}
            <div className="mb-6 space-y-1">
              <h2 className="text-3xl font-bold text-gray-800">
                {formatPriceClean(precioNumerico)}
              </h2>
              <p className="text-xl text-[#7b5ca2] font-medium">
                {formatPriceClean(precioTransferencia)} con Transferencia
                Bancaria o Depósito 💜
              </p>

              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#ff0066] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center">
                    GO
                  </span>
                  <span className="text-gray-700 font-bold text-lg">
                    Cuotas SIN interés con{" "}
                    <span className="font-extrabold">DÉBITO</span>
                  </span>
                  <Info className="w-4 h-4 text-[#ff0066]" />
                </div>
                <p className="text-gray-600">
                  3 cuotas sin interés de {formatPriceClean(valorCuotaGO)}
                </p>
                <p className="text-gray-600 text-sm">
                  10% de descuento pagando con Transferencia Bancaria o Depósito
                  💜
                </p>
              </div>
            </div>

            {/* CARTEL DE TIEMPO DE PRODUCCIÓN */}
            <div className="bg-[#f3f0ff] border-l-4 border-[#7b5ca2] p-4 mb-8 rounded-r-xl">
              <p className="text-[#6c5b7b] text-xs font-bold leading-relaxed uppercase">
                Nuestro tiempo de producción en remeras es de 10 a 14 días
                hábiles. <br />
                Consultar por productos en stock para entrega inmediata.
              </p>
            </div>

            {/* SELECTORES DE TALLE Y COLOR (Sin cambios significativos) */}
            {tallesDisponibles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase">
                  Talle: {selectedTalle || "Seleccioná"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {tallesDisponibles.map((talle) => (
                    <button
                      key={talle}
                      onClick={() => setSelectedTalle(talle)}
                      className={`px-4 py-2 border-2 rounded-xl font-bold transition-all ${selectedTalle === talle ? "border-[#7b5ca2] bg-[#7b5ca2] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-[#d8c4fa]"}`}
                    >
                      {talle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {coloresDisponibles.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase">
                  Color: {selectedColor || "Seleccioná"}
                </label>
                <div className="flex flex-wrap gap-3">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor:
                          COLOR_MAP[color.toLowerCase()] || "#eee",
                      }}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === color ? "border-[#7b5ca2] scale-110 shadow-lg" : "border-gray-200 hover:scale-105"}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CAJA DE ACCIÓN */}
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-sm">
              <div className="flex flex-col gap-5">
                {varianteSeleccionada &&
                  stockDisponible <= 5 &&
                  stockDisponible > 0 && (
                    <p className="text-orange-500 text-[11px] font-bold uppercase animate-pulse">
                      ¡Solo quedan {stockDisponible} unidades!
                    </p>
                  )}

                {varianteSeleccionada && stockDisponible === 0 ? (
                  <div className="py-4 px-6 bg-red-50 text-red-500 rounded-2xl font-bold text-center border border-red-100 uppercase">
                    Agotado
                  </div>
                ) : (
                  <>
                    <QuantitySelector
                      quantity={quantity}
                      stock={stockDisponible}
                      onChange={setQuantity}
                      disabled={processing}
                    />
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-4 text-white rounded-2xl font-bold text-lg uppercase transition-all shadow-lg ${
                        processing
                          ? "bg-gray-400 cursor-wait"
                          : "bg-[#7b5ca2] hover:bg-[#665ca2] active:scale-[0.95]"
                      }`}
                    >
                      {processing ? "Agregando..." : "Agregar al carrito"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-[#6c5b7b] border-b-2 border-purple-100 pb-2 uppercase mb-4">
                Descripción
              </h3>
              <div
                className="prose prose-purple text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.descripcion || "" }}
              />
            </div>
          </div>
        </div>
      </div>
      {lastAddedItem && <AddedToCartModal />}
    </div>
  );
}
