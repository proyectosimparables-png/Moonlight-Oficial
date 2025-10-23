import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  title: string;
  products: Array<{
    image: string;
    name: string;
    price: number;
  }>;
}

const ProductSection = ({ title, products }: ProductSectionProps) => {
  return (
    <section className="py-12 bg-[#FAFCEF] text-[#6c5b7b]">
      <div className="container mx-auto px-4">
        {/* Título y botón */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-[#7b5ca2] italic">
            {title}
          </h2>
          <Button
            variant="ghost"
            className="text-[#7b5ca2] hover:text-white hover:bg-[#7b5ca2]/80 transition-colors"
          >
            Ver todo
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
