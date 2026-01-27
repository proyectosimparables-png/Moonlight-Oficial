"use client";

import Image from "next/image";
import Head from "next/head";
import { QuantitySelector } from "@/components/cart/QuantitySelector";
import { useProductDetails } from "@/services/useProductDetails";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { AddedToCartModal } from "@/components/cart/AddedToCartModal";
import { Producto } from "@/types/types-productos";
import { COLOR_MAP } from "@/lib/colores";

interface DetailsProductsProps {
  initialProduct: Producto;
}

export default function DetailsProducts({ initialProduct }: DetailsProductsProps) {
  const product = initialProduct;
  const { addItem, lastAddedItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const { loading, error } = useProductDetails(String(product.id));

  //colores y talles
  const [selectedTalle, setSelectedTalle] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");


  useEffect(() => {
    if (product) {
      // Priorizamos la imagen principal y luego las del array
      const initialImage = product.imagenUrl || (product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].url : "");
      setSelectedImage(initialImage);
    }
  }, [product]);

  // 💰 FUNCIÓN CORREGIDA: Formatea el precio manteniendo el valor real
  const formatPriceClean = (value: any) => {
    if (!value) return "$ 0";

    // Si viene como string "$ 50.000,00", extraemos solo los números
    // Pero tenemos cuidado de no romper miles
    let numericValue = value;
    if (typeof value === "string") {
      // Eliminamos el símbolo $, espacios y los decimales tras la coma
      const baseValue = value.split(',')[0];
      numericValue = Number(baseValue.replace(/[^0-9]/g, ""));
    }

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (error) return <p className="p-6">Error: {error}</p>;
  if (!product) return <p className="p-6">Producto no encontrado</p>;

  // 📸 GALERÍA CORREGIDA: Aseguramos que todas las imágenes del array se muestren
  const allImages = [
    ...(product.imagenUrl ? [product.imagenUrl] : []),
    ...(product.imagenes?.map((img: any) => img.url) || []) // 👈 .url es la clave
  ].filter((url, index, self) => url && self.indexOf(url) === index);

  const handleAddToCart = async () => {

    if (product.talles?.length > 0 && !selectedTalle) {
      return alert("Por favor, selecciona un talle");
    }
    if (product.colores?.length > 0 && !selectedColor) {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf5e500" }}>
      <Head>
        <title>{product.nombre} | Moonlight</title>
      </Head>

      <div className="container mx-auto p-6 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">

          {/* --- COLUMNA IZQUIERDA: IMÁGENES --- */}
          <div className="md:w-1/2 flex flex-col gap-4">
            {/* Imagen Principal */}
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
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">Sin imagen</div>
              )}
            </div>

            {/* Miniaturas: Ahora sí aparecerán */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {allImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === imgUrl
                    ? "border-[#7b5ca2] scale-105 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100"
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

          {/* COLUMNA DERECHA: INFO */}
          <div className="flex-1 max-w-xl">
            <nav className="text-sm text-gray-500 mb-2 font-medium">
              Producto / <span className="text-[#7b5ca2]">{product.nombre}</span>
            </nav>

            <h1 className="text-4xl font-serif font-bold text-[#6c5b7b] mb-2 uppercase tracking-tight">
              {product.nombre}
            </h1>

            <p className="text-3xl font-semibold text-[#7b5ca2] mb-6">
              {formatPriceClean(product.precio)}
            </p>

            {/* --- SELECCIÓN DE TALLES --- */}
            {product.talles && product.talles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#6c5b7b] mb-3 uppercase tracking-wider">
                  Talle: <span className="text-[#7b5ca2] font-extrabold">{selectedTalle || "Seleccioná uno"}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.talles.map((talle: string) => (
                    <button
                      key={talle}
                      type="button"
                      onClick={() => setSelectedTalle(talle)}
                      className={`min-w-[50px] px-4 py-2 border-2 rounded-xl text-sm font-bold transition-all ${selectedTalle === talle
                          ? "border-[#7b5ca2] bg-[#7b5ca2] text-white shadow-md scale-105"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#d8c4fa]"
                        }`}
                    >
                      {talle}
                      {/* Si el producto tiene un corte (ej. Oversize), lo mostramos al lado */}
                      {product.cortes && product.cortes.length > 0 && (
                        <span className={`ml-1 text-[10px] block opacity-70 ${selectedTalle === talle ? 'text-white' : 'text-gray-400'}`}>
                          ({product.cortes[0]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                        title={color}
                        className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center relative ${selectedColor === color
                            ? "border-[#7b5ca2] scale-110 shadow-lg"
                            : "border-gray-200 hover:border-[#d8c4fa]"
                          }`}
                        style={{ backgroundColor: colorHex }}
                      >
                        {/* Indicador de selección: un puntito central */}
                        {selectedColor === color && (
                          <div className={`w-2.5 h-2.5 rounded-full ${isWhite ? "bg-black" : "bg-white shadow"}`} />
                        )}
                        {/* Tooltip con el nombre por si el color es raro */}
                        <span className="sr-only">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-sm mb-8">
              <label className="block text-sm font-bold text-[#6c5b7b] mb-4 uppercase tracking-wider">Cantidad</label>
              {product.stock && product.stock > 0 ? (
                <div className="flex flex-col gap-5">
                  <QuantitySelector
                    quantity={quantity}
                    stock={product.stock}
                    onChange={setQuantity}
                    disabled={processing}
                  />
                  <button
                    className={`w-full py-4 rounded-2xl font-bold text-lg uppercase tracking-widest transition-all shadow-lg ${processing
                      ? "bg-gray-400 cursor-wait"
                      : "bg-[#7b5ca2] hover:bg-[#665ca2] text-white hover:shadow-purple-200"
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
                className="prose prose-purple text-gray-700 leading-relaxed font-medium"
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