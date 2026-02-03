"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp, Loader2 } from "lucide-react";
import { fetchResumenGeneral } from "@/services/dashboardAdmin";
 // Asegúrate de crear esta función

const Dashboard = () => {
  // Una sola petición para todo el dashboard
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchResumenGeneral,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-purple)]" />
        <p className="text-sm font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  if (isError) return <div>Error al cargar las estadísticas.</div>;

  const statsCards = [
    {
      title: "Total Productos",
      value: data.totalProductos,
      change: "+2", // Puedes calcular esto en el backend si quieres
      label: "nuevos esta semana",
      icon: Package,
      trend: "up",
    },
    {
      title: "Órdenes Activas",
      value: data.ordenesActivas,
      change: "En curso",
      label: "requieren atención",
      icon: ShoppingCart,
      trend: "neutral",
    },
    {
      title: "Usuarios Registrados",
      value: data.usuariosRegistrados,
      change: "10%",
      label: "vs. mes pasado",
      icon: Users,
      trend: "up",
    },
    {
      title: "Ventas del Mes",
      value: `$${data.ventasDelMes.toLocaleString("es-AR")}`,
      change: "15%",
      label: "promedio diario",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">
          Resumen
        </h1>
        <p className="text-[var(--color-dark-gray)]">
          Resumen general de tu tienda de ropa
        </p>
      </div>

      {/* Grid de Cards de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="bg-[var(--color-cream)] border-[var(--color-purple)]/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-[var(--color-purple)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs mt-1">
                <span className={
                  stat.trend === "up" ? "text-green-600 font-bold" :
                  stat.trend === "down" ? "text-red-600 font-bold" : "text-muted-foreground"
                }>
                  {stat.trend === "up" ? "↑ " : stat.trend === "down" ? "↓ " : ""}
                  {stat.change}
                </span>
                {" "}{stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Ventas Recientes */}
        <Card className="col-span-4 border border-[var(--color-purple)]/20 bg-[var(--color-cream)]">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.ventasRecientes?.map((orden: any) => (
                <div key={orden.id} className="flex items-center gap-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-purple-100">
                    <img
                      src={orden.user?.imagenUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(orden.user?.name || "U")}&background=8b5cf6&color=fff`}
                      alt="User"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{orden.user?.name || "Usuario Anónimo"}</p>
                    <p className="text-xs text-gray-500">
                      ID: {orden.id.slice(-6).toUpperCase()} • {new Date(orden.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-purple)]">
                    +${orden.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productos Populares */}
        <Card className="col-span-3 border border-[var(--color-purple)]/20 bg-[var(--color-cream)]">
          <CardHeader>
            <CardTitle>Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.productosPopulares?.map((product: any) => (
                <div key={product.productoId} className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-white flex-shrink-0">
                    <img
                      src={product.imagen || "/placeholder-product.png"}
                      alt={product.nombre}
                      className="object-contain p-1 w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold line-clamp-1">{product.nombre}</p>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
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