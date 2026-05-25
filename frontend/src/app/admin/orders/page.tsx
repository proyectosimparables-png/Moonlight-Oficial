// src/app/admin/ventas/page.tsx

import OrdenesTable from "@/componentes/admin/OrderActions";
import { adminOrderService } from "@/services/admin/admin-orders-service";

export default async function VentasPage() {
  // Consumimos directamente el servicio limpio que respeta variables de entorno
  const ordenes = await adminOrderService.getOrdenesAdmin();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Ventas</h1>
        <p className="text-gray-500">
          Administra los pedidos y estados de envío de Moonlight.
        </p>
      </div>

      <OrdenesTable ordenes={ordenes} />
    </div>
  );
}
