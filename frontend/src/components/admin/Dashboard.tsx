"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { fetchResumenGeneral } from "@/services/dashboardAdmin";

// Interfaces corregidas según tu esquema de Prisma
interface OrdenReciente {
  id: string;
  total: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    image?: string; // Corregido: User usa 'image' en el schema
  };
}

interface ProductoPopular {
  productoId: string;
  nombre: string;
  vendidos: number;
  imagen?: string;
}

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchResumenGeneral,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-(--color-purple)" />
        <p className="text-sm font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-red-500 font-medium">
        Error al cargar las estadísticas.
      </div>
    );
  }

  // Prevenimos undefined en los porcentajes y valores
  const statsCards = [
    {
      title: "Total Productos",
      value: data.totalProductos ?? 0,
      change: "",
      label: "en catálogo actual",
      icon: Package,
      trend: "neutral",
    },
    {
      title: "Órdenes Activas",
      value: data.ordenesActivas ?? 0,
      change: "Pendientes",
      label: "esperando gestión",
      icon: ShoppingCart,
      trend: "neutral",
    },
    {
      title: "Usuarios Registrados",
      value: data.usuariosRegistrados ?? 0,
      change: `${data.cambioUsuarios ?? 0}%`,
      label: "vs. mes pasado",
      icon: Users,
      trend: (data.cambioUsuarios ?? 0) >= 0 ? "up" : "down",
    },
    {
      title: "Ventas del Mes",
      value: `$${(data.ventasDelMes ?? 0).toLocaleString("es-AR")}`,
      change: `${data.cambioVentas ?? 0}%`,
      label: "vs. mes pasado",
      icon: TrendingUp,
      trend: (data.cambioVentas ?? 0) >= 0 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-(--text-heading)">
          Resumen
        </h1>
        <p className="text-(--color-dark-gray)">
          Estado general de Moonlight-Oficial
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="bg-(--color-cream) border-(--color-purple)/20 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-(--color-purple)" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs mt-1">
                <span
                  className={
                    stat.trend === "up"
                      ? "text-green-600 font-bold"
                      : stat.trend === "down"
                        ? "text-red-600 font-bold"
                        : "text-muted-foreground"
                  }
                >
                  {stat.trend === "up"
                    ? "↑ "
                    : stat.trend === "down"
                      ? "↓ "
                      : ""}
                  {stat.change}
                </span>{" "}
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Ventas Recientes */}
        <Card className="col-span-4 border border-(--color-purple)/20 bg-(--color-cream)">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.ventasRecientes?.map((orden: OrdenReciente) => (
                <div key={orden.id} className="flex items-center gap-4">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-purple-100 bg-white">
                    <Image
                      src={
                        orden.user?.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(orden.user?.name || "U")}&background=8b5cf6&color=fff`
                      }
                      alt={orden.user?.name || "User"}
                      fill
                      className="object-cover"
                      // Agregamos esto para permitir el SVG de ui-avatars sin errores
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {orden.user?.name || "Usuario Anónimo"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {orden.id.slice(-6).toUpperCase()} •{" "}
                      {new Date(orden.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-(--color-purple)">
                    +${orden.total.toLocaleString("es-AR")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productos Populares */}
        <Card className="col-span-3 border border-(--color-purple)/20 bg-(--color-cream)">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.productosPopulares?.map((product: ProductoPopular) => (
                <div
                  key={product.productoId}
                  className="flex items-center gap-4"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white">
                    <Image
                      src={product.imagen || "/placeholder-product.png"}
                      alt={product.nombre}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold line-clamp-1">
                      {product.nombre}
                    </p>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {product.vendidos} vendidos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
