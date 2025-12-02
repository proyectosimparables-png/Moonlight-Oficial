// app/seccion/[slug]/page.tsx

import ProductCard from "@/components/home/ProductCard";
import { VolverInicioButton } from "@/components/navbar/BotonDeInicio";
interface Product {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
}

interface SectionData {
  nombre: string;
  productos: Product[];
}

export default async function SeccionPage({ params }: { params: { slug: string } }) {
  const { slug } = await params; 


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

let data: SectionData  ;

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
    <section className="py-12 bg-[#FAFCEF] text-[#6c5b7b] min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-3xl md:text-4xl text-[#7b5ca2] italic mb-8 text-center">
          {data.nombre || slug.replace(/-/g, " ")} 
        </h1>
        <VolverInicioButton />
        {data.productos?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {data.productos.map((product:Product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.imagenUrl}
                name={product.nombre}
                price={`$ ${product.precio.toLocaleString("es-AR")}`}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#7b5ca2]/70">No hay productos en esta sección.</p>
        )}
      </div>
    </section>
  );
}
