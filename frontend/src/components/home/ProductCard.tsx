"use client";

import Image from "next/image";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";
import { CartService } from "@/services/cartService";

// ✅ Interfaz actualizada para incluir el slug
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
  slug: slugFromProps, // Renombrado para la lógica de fallback
  imagenUrl,
  imagenHoverUrl,
  nombre,
  precio,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  // 🛡️ LÓGICA DE FALLBACK PARA SLUG: Si no viene del back, lo generamos del nombre
  // Esto evita que la URL use el ID y cause el error 404
  const slug =
    slugFromProps ||
    nombre
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quita acentos
      .replace(/\s+/g, "-") // Espacios por guiones
      .replace(/[^\w-]+/g, "") // Quita caracteres especiales
      .replace(/--+/g, "-"); // Evita guiones dobles

  // 💰 Lógica de Precios
  const numericPrice =
    typeof precio === "number"
      ? precio
      : Number(String(precio ?? "0").replace(/[^\d]/g, ""));

  const discountPrice = numericPrice * 0.9;
  const installmentPrice = Math.round(numericPrice / 3);

  const formatARS = (value: number) =>
    value.toLocaleString("es-AR", { minimumFractionDigits: 0 });

  // 🛒 Manejo de Carrito
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos", {
        position: "top-center",
      });
      router.push("/login");
      return;
    }
    try {
      addItem(id, 1);
      if (user?.id) {
        await CartService.syncWithBackend(user.id, [
          { productoId: id, cantidad: 1 },
        ]);
      }
      toast.success("Producto agregado al carrito", { position: "top-center" });
    } catch (error) {
      console.error("Error al sincronizar carrito:", error);
    }
  };

  // 🔗 NAVEGACIÓN BLINDADA: Siempre usará un slug válido
  const navigateToDetail = () => {
    router.push(`/productos/${slug}`);
  };

  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-xl transition-all duration-300 rounded-lg">
      <CardContent className="p-0">
        <div
          className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
          onClick={navigateToDetail}
        >
          {/* IMAGEN 2 (Hover) */}
          {imagenHoverUrl && (
            <Image
              src={imagenHoverUrl}
              alt={`${nombre} vista 2`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          )}

          {/* IMAGEN 1 (Principal) */}
          <Image
            src={imagenUrl || "/images/placeholder.png"}
            alt={nombre}
            fill
            className={`object-cover transition-opacity duration-500 ease-in-out ${
              imagenHoverUrl ? "group-hover:opacity-0" : ""
            }`}
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          {/* Overlay */}
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
              toggleFavorite(id);
            }}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Star
              className={`h-5 w-5 ${isFavorite(id) ? "fill-[#f5c518] text-[#f5c518]" : "text-[#6c5b7b]"}`}
            />
          </button>

          {/* Carrito Rápido */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 z-20 bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow-lg rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Info del producto */}
        <div className="p-4 cursor-pointer" onClick={navigateToDetail}>
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
