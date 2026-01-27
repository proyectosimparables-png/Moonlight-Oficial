import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ ¡Pago Completado!
      </h1>
      <p className="text-gray-600 mt-4">
        Tu pedido ha sido procesado con éxito.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
