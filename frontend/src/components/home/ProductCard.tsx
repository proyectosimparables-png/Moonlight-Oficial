import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
}

const ProductCard = ({ image, name, price }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden bg-white border border-[#ddd] hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-0">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />

          {/* Botón flotante */}
          <Button
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#7b5ca2] hover:bg-[#665ca2] text-white shadow"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Info del producto */}
        <div className="p-4">
          <h3 className="text-[#6c5b7b] font-medium mb-2 text-sm md:text-base">
            {name}
          </h3>
          <p className="text-[#7b5ca2] font-serif text-lg font-semibold">
            ${price.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
