import Image from "next/image";
import { Mail, Phone, Package, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import OrderHeader from "@/components/admin/Vendidos";
import { adminOrderService } from "@/services/admin/admin-ordenes-service";
import StatusActionButton from "@/components/admin/StatusCardActions";
import AdminNotesSection from "@/components/admin/AdminNotesSection";

interface OrderItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string | null;
}

interface Order {
  id: string;
  estado: string;
  total: number;
  createdAt: Date;
  metodoEnvio?: string | null;
  costoEnvio: number;
  nombreDestinatario?: string | null;
  apellidoDestinatario?: string | null;
  emailContacto?: string | null;
  telefonoDestinatario?: string | null;
  dniDestinatario?: string | null;
  calle?: string | null;
  numero?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  metodoPago: string;
  notasEntrega?: string;
  notasAdmin?: string;
  items: OrderItem[];
}

export default async function DetalleVentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orden = (await adminOrderService.getOrderById(id)) as Order | null;

  if (!orden) notFound();

  const subtotal = orden.items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  return (
    // Reducido padding y ancho máximo
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-[#f8f9fa] min-h-screen">
      <OrderHeader
        ordenId={orden.id}
        estado={orden.estado}
        fecha={orden.createdAt}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {/* Gap reducido de 8 a 6 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card de Productos */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b py-2.5 px-4 flex flex-row items-center justify-between bg-white">
              <CardTitle className="text-[13px] font-medium flex items-center gap-2 text-gray-500">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded border text-[10px]">
                  #1
                </span>
                {orden.items.length}{" "}
                {orden.items.length === 1 ? "unidad" : "unidades"} en Moonlight
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[11px] font-medium rounded-full bg-gray-50 px-2 py-0"
              >
                <Package className="h-3 w-3 mr-1" />
                {orden.estado === "EMPAQUETADO"
                  ? "Empaquetado"
                  : "Por empaquetar"}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {orden.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border-b last:border-0"
                >
                  <div className="relative h-16 w-16 shrink-0 border rounded overflow-hidden bg-gray-50">
                    <Image
                      src={item.imagenUrl || "/placeholder.png"}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#0061E0] text-base leading-tight">
                      {item.nombre}
                    </h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {item.cantidad}x ${item.precio.toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="text-right font-bold text-base text-gray-900">
                    ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                  </div>
                </div>
              ))}

              {/* Sección de Envío - Más compacta */}
              <div className="p-4 space-y-1 text-[13px] text-gray-800 border-t bg-white">
                <p className="font-bold">{orden.metodoEnvio || "Envío Nube"}</p>
                <p className="text-gray-500 uppercase text-[10px] leading-tight">
                  {orden.localidad} - {orden.calle} {orden.numero}
                </p>
                <p className="pt-1 text-gray-500 text-[12px]">
                  Peso: 0.5 kg | Dimensiones: 30 x 18 x 10 cm
                </p>
                <p className="font-bold mt-1 text-gray-900">
                  Valor etiqueta: ${orden.costoEnvio.toLocaleString("es-AR")}
                </p>
                <div className="pt-4">
                  <StatusActionButton
                    ordenId={orden.id}
                    estado={orden.estado}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Pago - Compacta */}
          <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="border-b py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-md font-bold text-gray-900">
                Pago
              </CardTitle>
              <Badge className="bg-[#E6F9F4] text-[#00A376] border-none font-bold text-[11px] px-2 py-0">
                $ {orden.estado === "PAGADO" ? "Recibido" : "Pendiente"}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">
                  Subtotal ({orden.items.length}{" "}
                  {orden.items.length === 1 ? "u." : "u."})
                </span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between text-[13px] pb-2">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold text-gray-900">
                  ${orden.costoEnvio.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t">
                <span className="font-bold text-sm text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  ${orden.total.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="pt-1 flex items-center gap-2 text-[12px] text-gray-500 italic">
                <CreditCard className="h-3.5 w-3.5" />
                <span>{orden.metodoPago.replace("_", " ")}</span>
              </div>
              {orden.notasEntrega && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-[12px]">
                  <p className="text-blue-700 italic">
                    &quot;{orden.notasEntrega}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <AdminNotesSection
            orderId={orden.id}
            initialNote={orden.notasAdmin || ""}
          />
        </div>
        {/* Sidebar - Menos "gritón" */}
        <div className="space-y-5">
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 px-4 pb-4 text-[13px]">
              <p className="font-bold text-gray-900 text-base">
                {orden.nombreDestinatario} {orden.apellidoDestinatario}
              </p>
              <div className="space-y-1.5 text-gray-600">
                <p className="flex items-center gap-2 hover:text-[#0061E0] cursor-pointer">
                  <Mail className="h-3.5 w-3.5" /> {orden.emailContacto}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {orden.telefonoDestinatario}
                </p>
                <div className="pt-1 border-t mt-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    DNI/CUIT
                  </p>
                  <p className="font-semibold text-gray-700">
                    {orden.dniDestinatario}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[13px] text-gray-600 pt-3 px-4 pb-4 space-y-3">
              <p className="leading-snug">
                <span className="font-bold text-gray-800">
                  {orden.metodoEnvio}
                </span>
                <br />
                {orden.calle} {orden.numero}
                <br />
                {orden.localidad}, {orden.provincia}
              </p>
              <p className="text-[11px] border-t pt-2 text-gray-400">
                Retira:{" "}
                <span className="font-bold text-gray-700">
                  {orden.nombreDestinatario}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
