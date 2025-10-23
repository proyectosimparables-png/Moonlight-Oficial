'use client';
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
import { Eye, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Datos mock basados en el esquema
const mockUsuarios = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    ordenes: 5,
    totalGastado: 450.50,
    fechaRegistro: "2024-01-10",
  },
  {
    id: "2",
    name: "María García",
    email: "maria.garcia@example.com",
    ordenes: 12,
    totalGastado: 890.30,
    fechaRegistro: "2023-12-15",
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos.lopez@example.com",
    ordenes: 3,
    totalGastado: 210.00,
    fechaRegistro: "2024-01-20",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    ordenes: 8,
    totalGastado: 620.75,
    fechaRegistro: "2024-01-05",
  },
  {
    id: "5",
    name: "Luis Rodríguez",
    email: "luis.rodriguez@example.com",
    ordenes: 15,
    totalGastado: 1250.00,
    fechaRegistro: "2023-11-28",
  },
];

const Usuarios = () => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios registrados
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Órdenes</TableHead>
              <TableHead>Total Gastado</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {getInitials(usuario.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{usuario.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{usuario.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{usuario.ordenes}</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  ${usuario.totalGastado.toFixed(2)}
                </TableCell>
                <TableCell>
                  {new Date(usuario.fechaRegistro).toLocaleDateString('es-ES')}
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

export default Usuarios;
