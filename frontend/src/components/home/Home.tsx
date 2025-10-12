"use client";

import Navbar from "@/components/home/Navbar";
// import HeroCarousel from "@/components/HeroCarousel";
// import ProductSection from "@/components/ProductSection";
// import Testimonials from "@/components/Testimonials";
// import Footer from "@/components/Footer";

// Imágenes comentadas (usaremos rutas públicas luego)
// import product1 from "@/assets/product-1.jpg";
// import product2 from "@/assets/product-2.jpg";
// import product3 from "@/assets/product-3.jpg";
// import product4 from "@/assets/product-4.jpg";

const Home = () => {
  // Sección de productos deshabilitada por ahora
  const productSections = [
    // {
    //   title: "Lo más vendido",
    //   products: [
    //     { image: product1, name: "Vestido Romántico", price: 8500 },
    //     { image: product2, name: "Blusa Delicada", price: 5200 },
    //     { image: product3, name: "Jarrón Minimalista", price: 3800 },
    //     { image: product4, name: "Set Accesorios", price: 4200 },
    //   ],
    // },
    // {
    //   title: "Lo más nuevo",
    //   products: [
    //     { image: product2, name: "Blusa Elegante", price: 5500 },
    //     { image: product1, name: "Vestido Primavera", price: 9200 },
    //     { image: product4, name: "Collar Delicado", price: 2800 },
    //     { image: product3, name: "Florero Moderno", price: 4100 },
    //   ],
    // },
    // ...
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0fa]">
      <Navbar />

      <main className="flex-1">
        {/* Carrusel de inicio (por ahora comentado) */}
        {/* <HeroCarousel /> */}

        {/* Secciones de productos (comentadas por ahora) */}
        {/* {productSections.map((section, index) => (
          <ProductSection key={index} {...section} />
        ))} */}

        {/* Testimonios (por ahora comentado) */}
        {/* <Testimonials /> */}
      </main>

      {/* Footer (por ahora comentado) */}
      {/* <Footer /> */}
    </div>
  );
};

export default Home;



