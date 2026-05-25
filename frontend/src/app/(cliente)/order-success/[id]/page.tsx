import TransferPaymentView from "@/componentes/pagos/Pago-transferencia";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: Props) {
  // En Next.js 15, los params se reciben como una Promise
  const { id } = await params;

  return (
    <div className="container mx-auto">
      {/* Llamamos al componente que pegaste en la carpeta components */}
      <TransferPaymentView params={{ id }} />
    </div>
  );
}
