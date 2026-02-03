import { CreditCard, MapPin, User, Mail, Phone, Calendar, Truck, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import OrderHeader from "@/components/admin/Vendidos";
import { adminOrderService } from "@/services/adminOrderService";

export default async function DetalleVentaPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {

  const resolvedParams = await params;
  const id = resolvedParams.id;

  const orden = await adminOrderService.getOrderById(id);

  if (!orden) {
    console.log("No se encontró la orden con ID:", id);
    notFound();
  }
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 bg-gray-50/30 min-h-screen">
      
      {/* Componente de Cliente para botones */}
      <OrderHeader ordenId={orden.id} estado={orden.estado} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Productos */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-violet-500" /> Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {orden.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-5 border-b last:border-0">
                  <img src={item.imagenUrl} className="h-20 w-20 rounded-lg object-cover border" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.nombre}</h4>
                    <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                  </div>
                  <div className="font-black">${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totales */}
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${(orden.total - (orden.costoEnvio || 0)).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío ({orden.metodoEnvio})</span>
                <span>${orden.costoEnvio?.toLocaleString('es-AR')}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-black text-emerald-600">${orden.total.toLocaleString('es-AR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Datos Cliente y Envío */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="border-l-4 border-l-violet-600">
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Cliente</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              <p className="font-bold text-lg">{orden.nombreDestinatario} {orden.apellidoDestinatario}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2"><Mail className="h-4 w-4" /> {orden.emailContacto}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="h-4 w-4" /> {orden.telefonoDestinatario}</p>
              <Badge variant="outline">DNI: {orden.dniDestinatario}</Badge>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Entrega</CardTitle></CardHeader>
            <CardContent className="p-6 text-sm space-y-2 bg-gray-50/50">
              <p className="font-bold">{orden.calle} {orden.numero}</p>
              <p>{orden.localidad}, {orden.provincia}</p>
              <p className="font-mono text-gray-500">CP: {orden.codigoPostal}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}