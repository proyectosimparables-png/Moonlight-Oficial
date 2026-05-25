import Link from "next/link";
import ClearCartRedirect from "@/componentes/pagos/ClearCartRedirect";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      {/* Este componente limpia el carrito sin afectar el resto del diseño */}
      <ClearCartRedirect />

      <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ ¡Pago Completado!
        </h1>
        <p className="text-gray-600 mb-8">
          Tu pedido ha sido procesado con éxito.
        </p>

        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
