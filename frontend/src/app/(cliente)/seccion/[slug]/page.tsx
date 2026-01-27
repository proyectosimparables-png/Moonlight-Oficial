// app/seccion/[slug]/page.tsx

import ProductCard from "@/components/home/ProductCard";
import { VolverInicioButton } from "@/components/navbar/BotonDeInicio";
import {ProductoBackend } from "@/types/types-productos";
//interface ProductoBackend {
//  productoId: string;
//  seccionId: string;
//  producto: {
//    id: string;
//    nombre: string;
//    precio: number;
//    precioPromocional?: number | null;
//    imagenUrl?: string | null;
//    imagenHoverUrl: string ;
//  };
//}

interface SectionData {
  nombre: string;
  productos: ProductoBackend[];
}


export default async function SeccionPage({ params }: { params: { slug: string } }) {
  // respeté tu línea original con await para params
  const { slug } = await params;

  // --- LÓGICA DE DÍA / NOCHE (se ejecuta en el servidor) ---
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 6;

  // paletas (ajustalas si querés otros tonos)
  const dayPalette = {
    text: "#6c5b7b",
    title: "#7b5ca2",
    muted: "rgba(123,92,162,0.7)",
  };

  const nightPalette = {
    text: "#f3e9ff",
    title: "#f7eaff",
    muted: "rgba(247,234,255,0.7)",
  };

  const palette = isNight ? nightPalette : dayPalette;

  // --- Fetch de datos ---
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/seccion/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {

    console.error("❌ Error al cargar la sección:", res.status, res.statusText);
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-600">
        Error cargando la sección ({res.status}).
      </div>
    );
  }

  let data: SectionData;

  try {
    data = await res.json();
  } catch (error) {
    console.error("❌ No se pudo parsear la respuesta JSON:", error);
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-600">
        Respuesta inválida del servidor.
      </div>
    );
  }

  return (
    <section
      className="py-12 bg-transparent min-h-screen transition-colors duration-500"
      style={{ color: palette.text }}
    >
      <div className="container mx-auto px-4">
        <h1
          className="font-serif text-3xl md:text-4xl italic mb-8 text-center transition-colors duration-500"
          style={{ color: palette.title }}
        >
          {data.nombre || slug.replace(/-/g, " ")}
        </h1>

        <VolverInicioButton />

        {data.productos?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {data.productos.map((item) => (
              <ProductCard
                key={item.id}
               id={`${item.id}`}
                nombre={item.nombre}
                imagenUrl={item.imagenUrl ?? "/placeholder.png"}
                imagenHoverUrl={item.imagenHoverUrl ?? "/placeholder.png"}
               precio={`$ ${(item.precio ?? 0).toLocaleString("es-AR")}`}
              />
            ))}
          </div>
        ) : (
          <p
            className="text-center mt-10 transition-colors duration-500"
            style={{ color: palette.muted }}
          >
            No hay productos en esta sección.
          </p>
        )}
      </div>
    </section>
  );
}
