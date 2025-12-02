// app/products/[id]/page.tsx

import DetailsProducts from "@/components/DetailsProducts";

interface PageProps {
  params: { id: string };
}

export default function ProductPage({ params }: PageProps) {
  return <DetailsProducts productId={params.id} />;
}
