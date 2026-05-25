// src/components/admin/OrderActions.tsx
"use client";

import { Fragment, useState } from "react";
import {
  MoreHorizontal,
  Package,
  Send,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Truck,
  ShoppingBag,
  Pencil,
  Archive,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { adminOrderService } from "@/services/admin/admin-orders-service";
import { ModalCancelarVenta } from "@/componentes/admin/ModalCancelarVenta";
import { OrderResponse } from "@/types/orders";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CancelData {
  motivo: string;
  restaurarStock: boolean;
  enviarEmail: boolean;
}

export default function OrdenesTable({
  ordenes,
}: {
  ordenes: OrderResponse[];
}) {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const ordenesFiltradas = ordenes.filter((o) => o.estado !== "CARRITO");

  const conteo = {
    porEmpaquetar: ordenes.filter((o) =>
      ["PAGADO", "PENDIENTE"].includes(o.estado),
    ).length,
    porEnviar: ordenes.filter((o) => o.estado === "EMPAQUETADO").length,
    enviados: ordenes.filter((o) => o.estado === "ENVIADO").length,
    cancelados: ordenes.filter((o) =>
      ["CANCELADO", "REEMBOLSADO"].includes(o.estado),
    ).length,
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAction = async (id: string, action: string) => {
    const loadingToast = toast.loading("Actualizando...");
    try {
      if (action === "REFUND") await adminOrderService.refundOrder(id);
      else if (action === "ENVIADO") await adminOrderService.notifyShipment(id);
      else await adminOrderService.updateStatus(id, action);

      toast.success("Orden actualizada", { id: loadingToast });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: loadingToast });
    }
  };

  const handleConfirmCancel = async (data: CancelData) => {
    if (!orderToCancel) return;

    const loadingToast = toast.loading("Cancelando venta...");
    try {
      await adminOrderService.cancelOrder(orderToCancel, data);
      toast.success("Venta cancelada correctamente", { id: loadingToast });
      setOrderToCancel(null);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al cancelar";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ModalCancelarVenta
        isOpen={!!orderToCancel}
        orderId={orderToCancel || ""}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleConfirmCancel}
      />

      {/* --- 1. RESUMEN SUPERIOR --- */}
      <div className="flex flex-wrap gap-4">
        {[
          {
            label: "Por empaquetar",
            count: conteo.porEmpaquetar,
            color: "text-purple-600",
            bg: "bg-purple-50",
            icon: Package,
          },
          {
            label: "Por enviar",
            count: conteo.porEnviar,
            color: "text-blue-500",
            bg: "bg-blue-50",
            icon: Send,
          },
          {
            label: "Enviados",
            count: conteo.enviados,
            color: "text-green-500",
            bg: "bg-green-50",
            icon: CheckCircle2,
          },
          {
            label: "Cancelados",
            count: conteo.cancelados,
            color: "text-gray-400",
            bg: "bg-gray-50",
            icon: Ban,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-2 bg-white border rounded-xl shadow-sm min-w-42.5"
          >
            <div className={`p-1.5 ${item.bg} ${item.color} rounded-lg`}>
              <item.icon size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">
                {item.label}
              </p>
              <p className="text-lg font-bold text-gray-800 leading-none">
                {item.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- 2. TABLA --- */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden text-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 h-11">
              <TableHead className="w-32 text-[10px] font-bold uppercase text-gray-400 pl-6">
                Venta
              </TableHead>
              <TableHead className="w-28 text-[10px] font-bold uppercase text-gray-400">
                Fecha
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-gray-400">
                Cliente
              </TableHead>
              <TableHead className="w-28 text-[10px] font-bold uppercase text-gray-400">
                Total
              </TableHead>
              <TableHead className="w-32 text-[10px] font-bold uppercase text-gray-400 text-center">
                Productos
              </TableHead>
              <TableHead className="w-36 text-[10px] font-bold uppercase text-gray-400">
                Pago
              </TableHead>
              <TableHead className="w-40 text-[10px] font-bold uppercase text-gray-400">
                Envío
              </TableHead>
              <TableHead className="w-12 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenesFiltradas.map((orden) => {
              const totalItems =
                orden.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0;
              const isPagado = [
                "PAGADO",
                "EMPAQUETADO",
                "ENVIADO",
                "ENTREGADO",
              ].includes(orden.estado);

              return (
                <Fragment key={orden.id}>
                  <TableRow className="group hover:bg-gray-50/30 transition-colors border-b last:border-0 h-16">
                    <TableCell className="pl-6 py-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/vendidos/${orden.id}`)
                        }
                        className="text-purple-500 text-[13px] flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        #{orden.id.split("-")[0].toUpperCase()}
                        <ExternalLink size={10} className="opacity-40" />
                      </button>
                    </TableCell>

                    <TableCell className="py-3 text-gray-400 text-[11px]">
                      {new Date(orden.createdAt).toLocaleDateString("es-AR")}
                    </TableCell>

                    <TableCell className="py-3 text-gray-600 text-[12px] font-medium">
                      {orden.user.name || "Invitado"}
                    </TableCell>

                    <TableCell className="py-3 font-semibold text-gray-800 text-sm">
                      ${orden.total.toLocaleString("es-AR")}
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => toggleRow(orden.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 text-[10px] font-bold hover:bg-purple-100 transition-colors"
                      >
                        <ShoppingBag size={13} />
                        {totalItems} u.
                        {expandedRows[orden.id] ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronRight size={13} />
                        )}
                      </button>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <Badge
                          variant="outline"
                          className={`w-fit text-[9px] font-bold px-2 py-0 border-none ${isPagado ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {isPagado ? "RECIBIDO" : "PENDIENTE"}
                        </Badge>
                        <span className="text-[9px] text-gray-300 font-semibold uppercase">
                          {orden.metodoPago || "MERCADO PAGO"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col gap-0.5">
                        <Badge
                          variant="outline"
                          className="w-fit bg-gray-50 text-gray-500 border-transparent text-[9px] font-bold px-2 py-0"
                        >
                          {["PENDIENTE", "PAGADO"].includes(orden.estado)
                            ? "POR EMPAQUETAR"
                            : orden.estado.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-[10px] text-gray-300 italic">
                          <Truck size={11} />
                          <span className="truncate max-w-28 uppercase">
                            {orden.metodoEnvio || "Local Propio"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-300" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(orden.id, "EMPAQUETADO")
                            }
                          >
                            <Package size={14} className="mr-2" /> Marcar como
                            empaquetado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(orden.id, "ENVIADO")}
                          >
                            <Send size={14} className="mr-2" /> Notificar envío
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/vendidos/editar/${orden.id}`)
                            }
                          >
                            <Pencil size={14} className="mr-2" /> Editar venta
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(orden.id, "ARCHIVAR")}
                          >
                            <Archive size={14} className="mr-2" /> Archivar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setOrderToCancel(orden.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Ban size={14} className="mr-2" /> Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {expandedRows[orden.id] && (
                    <TableRow className="bg-gray-50/20 border-b">
                      <TableCell colSpan={8} className="p-4 pl-12">
                        <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-top-1">
                          {orden.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm min-w-48"
                            >
                              <div className="relative w-9 h-9 shrink-0">
                                <Image
                                  src={item.imagenUrl}
                                  alt={item.nombre}
                                  fill
                                  className="rounded-lg object-cover border"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[11px] font-semibold text-gray-700 truncate leading-tight">
                                  {item.nombre}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  {item.cantidad} x $
                                  {item.precio.toLocaleString("es-AR")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
