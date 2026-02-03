'use client';

import { Fragment, useState } from "react";
import {
  MoreHorizontal, Package, Send, RotateCcw, Ban,
  CheckCircle2, ChevronDown, ChevronRight, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { adminOrderService } from '@/services/adminOrderService';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";

// --- Interfaces ---
export interface OrdenItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl: string;
}

export interface OrdenReal {
  id: string;
  total: number;
  estado: string;
  createdAt: string;
  user: { name: string | null; email: string };
  metodoEnvio: string | null;
  items: OrdenItem[];
}

export default function OrdenesTable({ ordenes }: { ordenes: OrdenReal[] }) {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Estado para el modal de confirmación (si lo necesitas manejar desde aquí)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 1. Filtrado y Conteos
  const ordenesFiltradas = ordenes.filter(o => o.estado !== 'CARRITO');

  const conteo = {
    porEmpaquetar: ordenes.filter(o => o.estado === 'PAGADO' || o.estado === 'PENDIENTE').length,
    porEnviar: ordenes.filter(o => o.estado === 'EMPAQUETADO').length,
    enviados: ordenes.filter(o => o.estado === 'ENVIADO').length,
    cancelados: ordenes.filter(o => o.estado === 'CANCELADO' || o.estado === 'REEMBOLSADO').length,
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 2. Manejo de Acciones
  const handleAction = async (id: string, action: string) => {

  if (action === 'CANCELADO') {
    const confirmacion = confirm("¿Estás seguro de que deseas cancelar esta orden?");
    if (!confirmacion) return;
  }

  const loadingToast = toast.loading('Actualizando...');
  
  try {
    if (action === 'REFUND') {
      await adminOrderService.refundOrder(id);
    } 
    // NUEVA LÓGICA: Si es enviar, usamos el servicio de despacho que manda el mail
    else if (action === 'ENVIADO') {
      await adminOrderService.notifyShipment(id);
    } 
    // Para todo lo demás (EMPAQUETADO, ENTREGADO, CANCELADO), solo actualizamos status
    else {
      await adminOrderService.updateStatus(id, action);
    }

    toast.success('Orden actualizada correctamente', { id: loadingToast });
    router.refresh();
  } catch (error) {
    console.error(error);
    toast.error('Error al procesar la acción', { id: loadingToast });
  }
};

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'PAGADO': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pagado</Badge>;
      case 'EMPAQUETADO': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Empaquetado</Badge>;
      case 'ENVIADO': return <Badge variant="default" className="bg-green-600">Enviado</Badge>;
      case 'ENTREGADO': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Entregado</Badge>;
      case 'CANCELADO': return <Badge variant="destructive">Cancelado</Badge>;
      case 'REEMBOLSADO': return <Badge variant="outline" className="bg-gray-100 text-gray-600">Reembolsado</Badge>;
      default: return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* --- BARRA DE CONTEO SUPERIOR --- */}
      <div className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-md border text-sm font-medium text-gray-600 shadow-sm">
        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <Package className="w-4 h-4 mr-2 text-purple-500" />
          Por empaquetar <span className="ml-2 text-purple-700 font-bold">{conteo.porEmpaquetar}</span>
        </div>
        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <Send className="w-4 h-4 mr-2 text-blue-500" />
          Por enviar <span className="ml-2 text-blue-600 font-bold">{conteo.porEnviar}</span>
        </div>
        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
          Enviados <span className="ml-2 text-green-600 font-bold">{conteo.enviados}</span>
        </div>
        <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
          <Ban className="w-4 h-4 mr-2 text-gray-400" />
          Cancelados <span className="ml-2 text-gray-500 font-bold">{conteo.cancelados}</span>
        </div>
      </div>

      {/* --- TABLA DE ÓRDENES --- */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[120px]">Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  No hay ventas procesadas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              ordenesFiltradas.map((orden) => (
                <Fragment key={orden.id}>
                  <TableRow className="hover:bg-gray-50/30 transition-colors border-b">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleRow(orden.id)}
                      >
                        {expandedRows[orden.id] ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/admin/vendidos/${orden.id}`)}
                        className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        #{orden.id.split('-')[0].toUpperCase()}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(orden.createdAt).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                          {orden.user.name || 'Cliente invitado'}
                        </span>
                        <span className="text-xs text-gray-400">{orden.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      ${orden.total.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Gestionar Pedido</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Opciones de Estado */}
                          <DropdownMenuItem onClick={() => handleAction(orden.id, 'EMPAQUETADO')}>
                            <Package className="mr-2 h-4 w-4 text-gray-500" /> Marcar Empaquetado
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(orden.id, 'ENVIADO')}>
                            <Send className="mr-2 h-4 w-4 text-gray-500" /> Notificar Envío
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(orden.id, 'ENTREGADO')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Marcar Entregado
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {/* Acciones Críticas */}
                          <DropdownMenuItem
                            onClick={() => handleAction(orden.id, 'REFUND')}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" /> Reembolsar (MP)
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleAction(orden.id, 'CANCELADO')}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600 font-medium"
                          >
                            <Ban className="mr-2 h-4 w-4" /> Cancelar Orden
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* --- Detalle de Productos --- */}
                  {expandedRows[orden.id] && (
                    <TableRow className="bg-gray-50/50 border-b">
                      <TableCell colSpan={7} className="p-4">
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Productos en este pedido:
                          </p>
                          <div className="grid gap-2">
                            {orden.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-md border shadow-sm">
                                <img
                                  src={item.imagenUrl}
                                  alt={item.nombre}
                                  className="w-12 h-12 rounded object-cover border bg-gray-100"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800">{item.nombre}</p>
                                  <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900">
                                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}