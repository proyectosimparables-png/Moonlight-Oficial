// src/types/dashboard.ts

export interface UsuarioResumen {
  name: string | null;
  email: string;
  image: string | null;
}

export interface OrdenReciente {
  id: string;
  total: number;
  createdAt: string;
  user: UsuarioResumen | null;
}

export interface ProductoPopular {
  productoId: string;
  nombre: string;
  vendidos: number;
  imagen: string | null;
}

// 👑 Esta es la que te estaba reclamando el Service:
export interface ResumenGeneralResponse {
  totalProductos: number;
  ordenesActivas: number;
  usuariosRegistrados: number;
  ventasDelMes: number;
  cambioVentas: number;
  cambioUsuarios: number;
  productosPopulares: ProductoPopular[];
  ventasRecientes: OrdenReciente[];
}