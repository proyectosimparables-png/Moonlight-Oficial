import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-red-600">
        ❌ El pago no pudo procesarse
      </h1>
      <p className="text-gray-600 mt-4">
        Hubo un problema con la transacción. Por favor, intenta de nuevo.
      </p>
      <Link
        href="/cart"
        className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-black"
      >
        Reintentar desde el carrito
      </Link>
    </div>
  );
}
