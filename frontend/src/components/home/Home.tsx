"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";
import ComentariosSection from "../ComentariosSeccion";

interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl?: string;
}

interface Section {
  id: string;
  nombre: string;
  slug: string;
  productos: Product[];
}


const Home = () => {
  const [sections, setSections] = useState<Section[]>([]);

  // 🟣 Orden deseado de las secciones
  const order = [
    "Los más elegidos",
    "Lo más nuevo",
    "Indumentaria",
    "Bangtan Limited Edition",
    "Bangtan Bags",
    "Bangtan Home",
    "Accesorios",
    "Outlet",
  ];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`
        );
        if (!res.ok) throw new Error("Error al obtener secciones");

        const data: Section[] = await res.json();

        // 🟣 Ordenamos según el orden definido arriba
        const sorted = [...data].sort((a, b) => {
          const indexA = order.indexOf(a.nombre);
          const indexB = order.indexOf(b.nombre);
          return (
            (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
          );
        });

        setSections(sorted);
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
            slug={section.slug} 
            products={section.productos.map((p) => ({
              id: p.id,
              name: p.nombre,
              price: p.precio,
              image: p.imagenUrl ?? "/placeholder.jpg",
            }))}
          />
        ))}
      </main>
      <ComentariosSection />
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
