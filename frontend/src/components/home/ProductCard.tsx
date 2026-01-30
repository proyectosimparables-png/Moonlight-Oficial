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
  slug: string; // Agregado para el ruteo amigable
  imagenUrl?: string;
  imagenHoverUrl?: string;
  nombre: string;
  precio: string;
}

const ProductCard = ({
  id,
  slug,
  imagenUrl,
  imagenHoverUrl,
  nombre,
  precio,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  // 💰 Lógica de Precios
  const numericPrice = Number((precio ?? "0").replace(/[^0-9]+/g, ""));
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

  // 🔗 NAVEGACIÓN CORREGIDA: Usa el slug para la URL
  const navigateToDetail = () => {
    // Si existe el slug lo usamos, sino usamos el id como fallback
    const target = slug || id;
    router.push(`/productos/${target}`);
  };

  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-xl transition-all duration-300 rounded-lg">
      <CardContent className="p-0">
        {/* Contenedor de Imagen */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
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

          {/* Overlay "Ver Detalle" */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 hover:bg-white text-[#6c5b7b] border-none shadow-sm"
              onClick={navigateToDetail}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalle
            </Button>
          </div>

          {/* ❤️ Favoritos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(id);
            }}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Star
              className={`h-5 w-5 transition-colors duration-200 ${
                isFavorite(id)
                  ? "fill-[#f5c518] text-[#f5c518]"
                  : "text-[#6c5b7b]"
              }`}
            />
          </button>

          {/* 🛒 Carrito Rápido */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 z-10 bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow-lg rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Info del producto */}
        <div className="p-4 cursor-pointer" onClick={navigateToDetail}>
          <h3 className="text-[#6c5b7b] font-medium mb-2 text-sm md:text-base line-clamp-2 min-h-[40px]">
            {nombre}
          </h3>

          <p className="text-[#7b5ca2] font-serif text-xl font-semibold">
            ${formatARS(numericPrice)}
          </p>

          <div className="mt-1">
            <p className="text-xs text-gray-500">
              <span className="font-bold text-[#4b3f68]">
                ${formatARS(discountPrice)}
              </span>{" "}
              Transferencia/Depósito
            </p>

            <p className="text-xs text-gray-500">
              3 cuotas sin interés de{" "}
              <span className="font-bold text-[#4b3f68]">
                ${formatARS(installmentPrice)}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
