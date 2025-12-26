// app/products/[id]/page.tsx

import DetailsProducts from "@/components/DetailsProducts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  return <DetailsProducts productId={id} />;
}
