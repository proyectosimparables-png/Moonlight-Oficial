"use client";

import Navbar from "@/components/home/Navbar";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductSection from "@/components/home/ProductSection";

// Usamos rutas públicas para las imágenes de productos
const productSections = [
  {
    title: "Los mas Elegidos!",
    products: [
      { image: "/product-1.jpg", name: "Jarrón Minimalista", price: 3800 },
      { image: "/product-2.jpg", name: "Set Accesorios", price: 4200 },
      { image: "/product-1.jpg", name: "Vela Aromática", price: 2900 },
      { image: "/product-2.jpg", name: "Camino de Mesa", price: 3500 },
    ],
  },
  {
    title: "Lo más nuevo",
    products: [
      { image: "/product-1.jpg", name: "Blusa Elegante", price: 5500 },
      { image: "/product-2.jpg", name: "Vestido Primavera", price: 9200 },
      { image: "/product-1.jpg", name: "Collar Delicado", price: 2800 },
      { image: "/product-2.jpg", name: "Florero Moderno", price: 4100 },
    ],
  },
  {
    title: "Ediciones especiales",
    products: [
      { image: "/product-1.jpg", name: "Kit Luna Llena", price: 7500 },
      { image: "/product-2.jpg", name: "Caja Ritual", price: 11200 },
      { image: "/product-1.jpg", name: "Pocillo Hecho a Mano", price: 4600 },
      { image: "/product-2.jpg", name: "Pack Bienestar", price: 9800 },
    ],
  },
  {
    title: "Ofertas",
    products: [
      { image: "/product-1.jpg", name: "Almohadón Boho", price: 3100 },
      { image: "/product-2.jpg", name: "Taza Cerámica", price: 1900 },
      { image: "/product-1.jpg", name: "Set Aromas", price: 3500 },
      { image: "/product-2.jpg", name: "Difusor Natural", price: 4200 },
    ],
  },
  {
    title: "Ropa",
    products: [
      { image: "/product-1.jpg", name: "Blusa Delicada", price: 5200 },
      { image: "/product-2.jpg", name: "Vestido Floral", price: 8700 },
      { image: "/product-1.jpg", name: "Kimono Suave", price: 6800 },
      { image: "/product-2.jpg", name: "Top Bordado", price: 4300 },
    ],
  },
  {
    title: "Bazar",
    products: [
      { image: "/product-1.jpg", name: "Florero de Vidrio", price: 3600 },
      { image: "/product-2.jpg", name: "Tabla Artesanal", price: 5600 },
      { image: "/product-1.jpg", name: "Plato Decorativo", price: 4100 },
      { image: "/product-2.jpg", name: "Set de Té", price: 7500 },
    ],
  },
];

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCEF] text-[#6c5b7b]">
      <Navbar />

      <main className="flex-1">
        <HeroCarousel />

        {productSections.map((section, index) => (
          <ProductSection key={index} {...section} />
        ))}
      </main>

      {/* <Footer /> lo agregás cuando esté listo */}
    </div>
  );
};

export default Home;
