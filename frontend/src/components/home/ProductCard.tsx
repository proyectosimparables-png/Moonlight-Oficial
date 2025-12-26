"use client";

import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  imagenUrl?: string;
  nombre: string;
  precio: string; // Formateado desde backend, ej: "$ 22.000"
}

const ProductCard = ({ id, imagenUrl, nombre, precio }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();


  // 💰 Convertimos precio a número para cálculos
  const numericPrice = Number((precio ?? "0").replace(/[^0-9]+/g, "")); // quita todo menos números
  const discountPrice = numericPrice * 0.9; // 10% OFF por transferencia
  const installmentPrice = numericPrice / 3; // 3 cuotas sin interés
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  // Función para formatear cualquier número a ARS
  const formatARS = (value: number) =>
    value.toLocaleString("es-AR", { minimumFractionDigits: 0 });


  // Función para requerir login antes de agregar al carrito
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos al carrito", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }

    addItem(id, 1);
    toast.success("Producto agregado al carrito", { position: "top-center" });
  };

  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-0">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden">
          <Image
<<<<<<< HEAD
            src={ imagenUrl || "/images/placeholder.png"}
            alt={nombre || "Imagen del producto"} 
=======
            src={image}
            alt={name || "Imagen del producto"}
>>>>>>> e08fc9411680f479c42991371d840a767ab19d9e
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          {/* ❤️ Corazoncito */}
          <button
            onClick={() => toggleFavorite(id)}
            className="absolute top-3 right-3 z-10"
            aria-label="Agregar a favoritos"
          >
            <Star
              className={`h-6 w-6 transition-colors duration-200 ${
                isFavorite(id)
                  ? "fill-[#f5c518] text-[#f5c518]"
                  : "text-[#6c5b7b]"
              }`}
            />
          </button>

          {/* 🛒 Botón del carrito */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow-lg"
            onClick={handleAddToCart}
            aria-label={`Agregar ${nombre} al carrito`}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Info del producto */}
        <div className="p-4">
          <h3 className="text-[#6c5b7b] font-medium mb-2 text-sm md:text-base line-clamp-2 min-h-[40px]">
            {nombre}
          </h3>

          {/* 💲 Precio principal */}
          <p className="text-[#7b5ca2] font-serif text-xl font-semibold">
            ${formatARS(numericPrice)}
          </p>

          {/* 💸 Precio con descuento */}
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium text-[#4b3f68]">
              ${formatARS(discountPrice)}
            </span>{" "}
            Con Transferencia o depósito
          </p>

          {/* 💳 Cuotas */}
          <p className="text-sm text-gray-600 mt-1">
            3 cuotas sin interés de{" "}
            <span className="font-medium text-[#4b3f68]">
              ${formatARS(installmentPrice)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
