'use client';

import { 
  MoreHorizontal, Package, Send, RotateCcw, Ban, CheckCircle2 
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

// Definimos la interfaz basada en tu esquema de Prisma
interface OrdenReal {
  id: string;
  total: number;
  estado: string;
  createdAt: string;
  user: { name: string | null; email: string };
  metodoEnvio: string | null;
}

export default function OrdenesTable({ ordenes }: { ordenes: OrdenReal[] }) {
  const router = useRouter();

  const handleAction = async (id: string, action: string) => {
    const loadingToast = toast.loading('Actualizando...');
    try {
      if (action === 'REFUND') {
        await adminOrderService.refundOrder(id);
      } else {
        await adminOrderService.updateStatus(id, action);
      }
      toast.success('Orden actualizada', { id: loadingToast });
      router.refresh(); // Refresca los Server Components
    } catch (error) {
      toast.error('Error al procesar la acción', { id: loadingToast });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'PAGADO': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pagado</Badge>;
      case 'EMPAQUETADO': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Empaquetado</Badge>;
      case 'ENVIADO': return <Badge variant="default" className="bg-green-600">Enviado</Badge>;
      case 'CANCELADO': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-[100px]">Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado del pago</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">No hay órdenes registradas.</TableCell>
            </TableRow>
          ) : (
            ordenes.map((orden) => (
              <TableRow key={orden.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-bold">#{orden.id.split('-')[0].toUpperCase()}</TableCell>
                <TableCell>{new Date(orden.createdAt).toLocaleDateString('es-AR')}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-blue-600">{orden.user.name || 'Cliente invitado'}</span>
                    <span className="text-xs text-gray-400">{orden.user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">${orden.total.toLocaleString('es-AR')}</TableCell>
                <TableCell>{getEstadoBadge(orden.estado)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Acciones de Orden</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleAction(orden.id, 'EMPAQUETADO')}>
                        <Package className="mr-2 h-4 w-4 text-gray-500" /> Marcar como empaquetada
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleAction(orden.id, 'ENVIADO')}>
                        <Send className="mr-2 h-4 w-4 text-gray-500" /> Notificar envío
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleAction(orden.id, 'ENTREGADO')}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Marcar entregado
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => handleAction(orden.id, 'REFUND')}
                        className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" /> Reembolsar pago (MP)
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleAction(orden.id, 'CANCELADO')}>
                        <Ban className="mr-2 h-4 w-4 text-gray-400" /> Cancelar orden
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}