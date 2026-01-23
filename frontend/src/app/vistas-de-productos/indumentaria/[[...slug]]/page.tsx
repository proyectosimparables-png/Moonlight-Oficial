import IndumentariaView from "@/components/vistas-de-todos-los-productos/IndumentariaView";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function Page({ params }: PageProps) {
  // En Next.js 15, params es una promesa.
  const resolvedParams = await params;

  return <IndumentariaView slug={resolvedParams.slug} />;
}
