'"use client";';
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
import { Eye } from "lucide-react";

// Datos mock basados en el esquema
const mockOrdenes = [
  {
    id: "1001",
    userId: "user-1",
    cliente: "Juan Pérez",
    producto: "Camiseta Básica Personalizada",
    cantidad: 3,
    total: 77.97,
    estado: "entregado",
    fecha: "2024-01-15",
  },
  {
    id: "1002",
    userId: "user-2",
    cliente: "María García",
    producto: "Sudadera Premium con Logo",
    cantidad: 2,
    total: 91.98,
    estado: "enviado",
    fecha: "2024-01-16",
  },
  {
    id: "1003",
    userId: "user-3",
    cliente: "Carlos López",
    producto: "Polo Bordado Empresarial",
    cantidad: 5,
    total: 162.5,
    estado: "pendiente",
    fecha: "2024-01-17",
  },
  {
    id: "1004",
    userId: "user-4",
    cliente: "Ana Martínez",
    producto: "Gorra Snapback Custom",
    cantidad: 10,
    total: 189.9,
    estado: "enviado",
    fecha: "2024-01-17",
  },
  {
    id: "1005",
    userId: "user-5",
    cliente: "Luis Rodríguez",
    producto: "Chaqueta Deportiva",
    cantidad: 1,
    total: 65.0,
    estado: "pendiente",
    fecha: "2024-01-18",
  },
];

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive"> = {
    pendiente: "secondary",
    enviado: "default",
    entregado: "default",
  };
  return variants[estado] || "secondary";
};

const Ordenes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-muted-foreground">
            Gestiona todos los pedidos de la tienda
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrdenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell className="font-medium">#{orden.id}</TableCell>
                <TableCell>{orden.cliente}</TableCell>
                <TableCell>
                  <p className="max-w-[200px] truncate">{orden.producto}</p>
                </TableCell>
                <TableCell>{orden.cantidad}</TableCell>
                <TableCell className="font-semibold">
                  ${orden.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadge(orden.estado)}>
                    {orden.estado.charAt(0).toUpperCase() +
                      orden.estado.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(orden.fecha).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Ordenes;
