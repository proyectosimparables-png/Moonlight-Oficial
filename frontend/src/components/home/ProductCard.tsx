"use client";

import Image from "next/image";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth"; // Reintegrado
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  slug: string;
  imagenUrl?: string;
  imagenHoverUrl?: string;
  nombre: string;
  precio: string | number;
}

const ProductCard = ({
  id,
  slug: slugFromProps,
  imagenUrl,
  imagenHoverUrl,
  nombre,
  precio,
}: ProductCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth(); // Obtenemos el usuario
  const router = useRouter();

  // Lógica de Fallback para Slug
  const slug =
    slugFromProps ||
    nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");

  // Lógica de Precios
  const numericPrice =
    typeof precio === "number"
      ? precio
      : Number(String(precio ?? "0").replace(/[^\d]/g, ""));

  const discountPrice = numericPrice * 0.9;
  const installmentPrice = Math.round(numericPrice / 3);

  const formatARS = (value: number) =>
    value.toLocaleString("es-AR", { minimumFractionDigits: 0 });

  // VALIDACIÓN DE NAVEGACIÓN
  const handleProtectedNavigation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!user) {
      // Si no hay usuario, al login
      router.push("/login");
    } else {
      // Si hay usuario, al detalle
      router.push(`/productos/${slug}`);
    }
  };

  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-xl transition-all duration-300 rounded-lg">
      <CardContent className="p-0">
        <div
          className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
          onClick={() => handleProtectedNavigation()}
        >
          {/* IMAGENES */}
          {imagenHoverUrl && (
            <Image
              src={imagenHoverUrl}
              alt={`${nombre} vista 2`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          )}

          <Image
            src={imagenUrl || "/images/placeholder.png"}
            alt={nombre}
            fill
            className={`object-cover transition-opacity duration-500 ease-in-out ${
              imagenHoverUrl ? "group-hover:opacity-0" : ""
            }`}
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          {/* Overlay Ver Detalle */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 hover:bg-white text-[#6c5b7b] border-none shadow-sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalle
            </Button>
          </div>

          {/* Favoritos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!user) return router.push("/login"); // También protegemos favoritos
              toggleFavorite(id);
            }}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Star
              className={`h-5 w-5 ${isFavorite(id) ? "fill-[#f5c518] text-[#f5c518]" : "text-[#6c5b7b]"}`}
            />
          </button>

          {/* 🛒 Carrito Rápido: Redirige con validación */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 z-20 bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow-lg rounded-full"
            onClick={handleProtectedNavigation}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Info del producto */}
        <div
          className="p-4 cursor-pointer"
          onClick={() => handleProtectedNavigation()}
        >
          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
            {nombre}
          </h3>
          <div className="space-y-1">
            <p className="text-lg font-bold text-[#6c5b7b]">
              ${formatARS(numericPrice)}
            </p>
            <p className="text-xs text-green-600 font-medium">
              ${formatARS(discountPrice)} pagando con transferencia
            </p>
            <p className="text-xs text-gray-500">
              3 cuotas sin interés de ${formatARS(installmentPrice)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
