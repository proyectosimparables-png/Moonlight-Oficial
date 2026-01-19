"use client";

import Image from "next/image";
import { ShoppingCart, Star, Eye } from "lucide-react"; // Importamos Eye para el detalle
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";
import { CartService } from "@/services/cartService";

interface ProductCardProps {
  id: string;
  imagenUrl?: string;
  imagenHoverUrl?: string; // Nueva prop para la segunda imagen
  nombre: string;
  precio: string;
}

const ProductCard = ({ id, imagenUrl, imagenHoverUrl, nombre, precio }: ProductCardProps) => {
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

  const numericPrice = Number((precio ?? "0").replace(/[^0-9]+/g, ""));
  const discountPrice = numericPrice * 0.9;
  const installmentPrice = Math.round(numericPrice / 3);

  const formatARS = (value: number) =>
    value.toLocaleString("es-AR", { minimumFractionDigits: 0 });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click dispare otros eventos
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para agregar productos", { position: "top-center" });
      router.push("/login");
      return;
    }
    try {
      addItem(id, 1);
      if (user?.id) {
        await CartService.syncWithBackend(user.id, [{ productoId: id, cantidad: 1 }]);
      }
      toast.success("Producto agregado al carrito", { position: "top-center" });
    } catch (error) {
      console.error("Error al sincronizar carrito:", error);
    }
  };

  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-xl transition-all duration-300 rounded-lg">
      <CardContent className="p-0">
        
        {/* Contenedor de Imagen con Efecto Hover */}
  <div className="relative aspect-square overflow-hidden bg-gray-100">
  {/* IMAGEN 2: Se queda quieta atrás */}
  {imagenHoverUrl && (
    <Image
      src={imagenHoverUrl}
      alt={`${nombre} vista 2`}
      fill
      className="object-cover" 
      sizes="(max-width: 768px) 100vw, 25vw"
    />
  )}

  {/* IMAGEN 1: Está encima y se desvanece al hacer hover */}
  <Image
    src={imagenUrl || "/images/placeholder.png"}
    alt={nombre}
    fill
    className={`object-cover transition-opacity duration-500 ease-in-out ${
      imagenHoverUrl ? "group-hover:opacity-0" : ""
    }`}
    sizes="(max-width: 768px) 100vw, 25vw"
  />

          {/* Overlay y Botón "Ver Detalle" */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              variant="secondary"
              className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white/90 hover:bg-white text-[#6c5b7b] border-none shadow-sm"
              onClick={() => router.push(`/products/${id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalle
            </Button>
          </div>

          {/* ❤️ Corazoncito */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
            className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Star
              className={`h-5 w-5 transition-colors duration-200 ${
                isFavorite(id) ? "fill-[#f5c518] text-[#f5c518]" : "text-[#6c5b7b]"
              }`}
            />
          </button>

          {/* 🛒 Botón del carrito */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 z-10 bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow-lg rounded-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>

        {/* Info del producto */}
        <div className="p-4 cursor-pointer" onClick={() => router.push(`/products/${id}`)}>
          <h3 className="text-[#6c5b7b] font-medium mb-2 text-sm md:text-base line-clamp-2 min-h-[40px]">
            {nombre}
          </h3>

          <p className="text-[#7b5ca2] font-serif text-xl font-semibold">
            ${formatARS(numericPrice)}
          </p>

          <p className="text-xs text-gray-500 mt-1">
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
      </CardContent>
    </Card>
  );
};

export default ProductCard;