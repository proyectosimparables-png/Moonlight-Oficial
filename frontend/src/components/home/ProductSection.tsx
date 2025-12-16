"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { useNightMode } from "@/context/NightModeContext";

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
  const { isNight } = useNightMode();

  return (
    <section
      className={`py-12 transition-colors duration-700 ${
        isNight ? "text-[#f3e9ff]" : "text-[#6c5b7b]"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Título y botón centrados */}
        <div className="flex flex-col items-center text-center mb-8">

          {/* TÍTULO DINÁMICO */}
          <h2
            className={`font-serif text-2xl md:text-3xl italic mb-2 transition-colors duration-700
              ${isNight ? "text-[#f5e9ff]" : "text-[#7b5ca2]"}
            `}
          >
            {title}
          </h2>

          {/* LÍNEA DECORATIVA */}
          <div
            className={`w-16 h-[2px] mb-3 transition-colors duration-700 ${
              isNight ? "bg-[#f0dfff]/50" : "bg-[#7b5ca2]/40"
            }`}
          ></div>

          {/* BOTÓN "VER TODO" */}
          <Link href={`/seccion/${slug}`}>
            <Button
              variant="ghost"
              className={`transition-colors duration-700 flex items-center
                ${
                  isNight
                    ? "text-[#f3e9ff] hover:bg-[#f3e9ff]/20 hover:text-white"
                    : "text-[#7b5ca2] hover:bg-[#7b5ca2]/80 hover:text-white"
                }
              `}
            >
              Ver todo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products
            .slice(-4)
            .map((product) => (
              <ProductCard
                key={product.id}
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
