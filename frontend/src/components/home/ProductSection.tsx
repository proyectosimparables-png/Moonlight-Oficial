import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Link from "next/link";

 export interface ProductSectionProps {
  title: string;
  slug: string;
  products: Array<{
    id: string;
    image: string;
    name: string;
    price: number;
  }>;
}

const ProductSection = ({ title, slug, products }: ProductSectionProps) => {
  return (
    <section className="py-12 bg-transparent text-[#6c5b7b]">
      <div className="container mx-auto px-4">
        {/* Título y botón centrados */}
        <div className="flex flex-col items-center text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-[#7b5ca2] italic mb-2">
            {title}
          </h2>

          <div className="w-16 h-[2px] bg-[#7b5ca2]/40 mb-3"></div>

          <Link href={`/seccion/${slug}`}>
            <Button
              variant="ghost"
              className="text-[#7b5ca2] hover:text-white hover:bg-[#7b5ca2]/80 transition-colors flex items-center"
            >
              Ver todo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products
            .slice(-4) // 👈 solo los últimos 4
            .map((product, index) => (
              <ProductCard
                key={index}
                id={product.id}
                image={product.image}
                name={product.name}
                price={`$ ${product.price.toLocaleString("es-AR")}`}
              />
            ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
