"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";
import ComentariosSection from "../ComentariosSeccion";
import MoonlightClubBanner from "@/components/home/MoonlightClubBanner";
import { apiRequest } from "@/lib/apiClient"; // 👈 Importamos tu cliente centralizado

interface Product {
  id: string;
  nombre: string;
  precio: string;
  imagenes?: string[];
}

interface Section {
  id: string;
  nombre: string;
  slug: string;
  productos: Product[];
}

const Home = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const visibleSections = ["Novedades", "Los más elegidos", "Outlet"];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        // 👈 Usamos apiRequest apuntando al endpoint directo
        const data = await apiRequest<Section[]>("/productos/secciones");

        const filteredAndSorted = data
          .filter((section) => visibleSections.includes(section.nombre))
          .sort(
            (a, b) =>
              visibleSections.indexOf(a.nombre) -
              visibleSections.indexOf(b.nombre),
          );

        setSections(filteredAndSorted);
      } catch (err) {
        console.error("Error cargando secciones:", err);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-[#6c5b7b]">
      <main className="flex-1">
        <HeroCarousel />

        {sections.map((section) => (
          <div key={section.id} className="my-8">
            <ProductSection
              title={section.nombre}
              slug={section.slug}
              products={section.productos.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                precio: p.precio,
                imagenes:
                  p.imagenes && p.imagenes.length > 0
                    ? p.imagenes
                    : ["/images/placeholder.png"],
              }))}
            />
            {section.nombre === "Novedades" && <MoonlightClubBanner />}
          </div>
        ))}
      </main>
      <ComentariosSection />
    </div>
  );
};

export default Home;
