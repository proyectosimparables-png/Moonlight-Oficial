"use client";

import { useEffect, useState } from "react";

import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";
import ComentariosSection from "../ComentariosSeccion";
import MoonlightClubBanner from "@/components/home/MoonlightClubBanner";

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

  // 🟣 SOLO estas secciones se muestran en Home
  const visibleSections = ["Novedades", "Los más elegidos", "Outlet"];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/productos/secciones`,
        );
        if (!res.ok) throw new Error("Error al obtener secciones");

        const data: Section[] = await res.json();

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
                // Aquí está el truco: enviamos el array de imágenes
                // Si p.imagenes no existe, enviamos un array con el placeholder
                imagenes:
                  p.imagenes && p.imagenes.length > 0
                    ? p.imagenes
                    : ["/images/placeholder.png"],
              }))}
            />

            {/* 🌙 Banner entre Novedades y Los más elegidos */}
            {section.nombre === "Novedades" && <MoonlightClubBanner />}
          </div>
        ))}
      </main>

      {/* 💬 Comentarios de las clientas */}
      <ComentariosSection />
    </div>
  );
};

export default Home;
