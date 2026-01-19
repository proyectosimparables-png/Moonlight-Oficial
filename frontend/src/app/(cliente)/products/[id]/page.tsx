// app/(cliente)/products/[id]/page.tsx
import DetailsProducts from "@/components/DetailsProducts";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    return <div className="p-10 text-center">Producto no encontrado en el servidor</div>;
  }

  const product = await res.json();

  // ✅ CAMBIO CLAVE: Cambia 'productId' por 'initialProduct'
  return <DetailsProducts initialProduct={product} />;
}