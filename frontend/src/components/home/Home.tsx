"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/home/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl?: string;
}

interface Section {
  id: string;
  nombre: string;
  productos: Product[];
}

const Home = () => {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`
        );
        if (!res.ok) throw new Error("Error al obtener secciones");

        const data: Section[] = await res.json();
        setSections(data);
      } catch (err) {
        console.error("Error cargando secciones:", err);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCEF] text-[#6c5b7b]">
      <Navbar />

      <main className="flex-1">
        <HeroCarousel />

        {sections.map((section) => (
          <ProductSection
            key={section.id}
            title={section.nombre}
            products={section.productos.map((p) => ({
              name: p.nombre,
              price: p.precio,
              image: p.imagenUrl ?? "/placeholder.jpg", // fallback si no hay imagen
            }))}
          />
        ))}
      </main>

      {/* <Footer /> lo agregás cuando esté listo */}
    </div>
  );
};

export default Home;
