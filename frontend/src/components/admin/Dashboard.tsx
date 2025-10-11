'use client';

import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { fetchOrdenesActivas, fetchProductosPopulares, fetchTotalProductos, fetchUsuariosRegistrados, fetchVentasDelMes, fetchVentasRecientes } from '@/services/dashboardAdmin';

const Dashboard = () => {
  const { data: totalProductos, isLoading: loadingTotalProductos } = useQuery({
    queryKey: ['totalProductos'],
    queryFn: fetchTotalProductos,
  });

  const { data: ordenesActivas, isLoading: loadingOrdenesActivas } = useQuery({
    queryKey: ['ordenesActivas'],
    queryFn: fetchOrdenesActivas,
  });

  const { data: usuariosRegistrados, isLoading: loadingUsuariosRegistrados } = useQuery({
    queryKey: ['usuariosRegistrados'],
    queryFn: fetchUsuariosRegistrados,
  });

  const { data: ventasDelMes, isLoading: loadingVentasDelMes } = useQuery({
    queryKey: ['ventasDelMes'],
    queryFn: fetchVentasDelMes,
  });

  const { data: ventasRecientes, isLoading: loadingVentasRecientes } = useQuery({
    queryKey: ['ventasRecientes'],
    queryFn: fetchVentasRecientes,
  });

  const { data: productosPopulares, isLoading: loadingProductosPopulares } = useQuery({
    queryKey: ['productosPopulares'],
    queryFn: fetchProductosPopulares,
  });

  if (
    loadingTotalProductos ||
    loadingOrdenesActivas ||
    loadingUsuariosRegistrados ||
    loadingVentasDelMes ||
    loadingVentasRecientes ||
    loadingProductosPopulares
  ) {
    return <div>Cargando datos...</div>;
  }

  const statsCards = [
    {
      title: "Total Productos",
      value: totalProductos ?? 'N/A',
      change: "+12% desde el mes pasado", 
      icon: Package,
    },
    {
      title: "Órdenes Activas",
      value: ordenesActivas ?? 'N/A',
      change: "+8% desde la semana pasada",
      icon: ShoppingCart,
    },
    {
      title: "Usuarios Registrados",
      value: usuariosRegistrados ?? 'N/A',
      change: "+23% desde el mes pasado",
      icon: Users,
    },
    {
      title: "Ventas del Mes",
      value: ventasDelMes ? `$${ventasDelMes.toLocaleString()}` : 'N/A',
      change: "+19% desde el mes pasado",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-dark-gray)]">
          Resumen general de tu tienda de ropa
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="overflow-hidden transition-all hover:shadow-lg border border-[var(--color-purple)] bg-[var(--color-cream)]"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-heading)]">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[var(--color-purple)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--text-heading)]">{stat.value}</div>
              <p className="text-xs text-[var(--color-dark-gray)]">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ventas recientes + Productos populares */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border border-[var(--color-purple)] bg-[var(--color-cream)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-heading)]">Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ventasRecientes?.map((orden) => (
                <div key={orden.id} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-[var(--color-purple)]/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-[var(--color-purple)]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-[var(--text-heading)] leading-none">
                      Orden #{orden.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="text-sm text-[var(--color-dark-gray)]">
                      Cliente {orden.user.name || orden.user.email} - Hace {Math.floor((Date.now() - new Date(orden.createdAt).getTime()) / 3600000)} horas
                    </p>
                  </div>
                  <div className="text-sm font-medium text-[var(--text-heading)]">
                    ${orden.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-[var(--color-purple)] bg-[var(--color-cream)]">
          <CardHeader>
            <CardTitle className="text-[var(--text-heading)]">Productos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productosPopulares?.map((product) => (
                <div key={product.nombre} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-[var(--color-purple)]/10" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-[var(--text-heading)]">
                      {product.nombre}
                    </p>
                    <p className="text-sm text-[var(--color-dark-gray)]">
                      {product.vendidos} vendidos
                    </p>
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
