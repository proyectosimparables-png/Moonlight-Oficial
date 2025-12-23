export interface UsuarioResumen {
  id: string;
  name: string | null;
  email: string;
}

export interface OrdenReciente {
  id: string;
  total: number;
  createdAt: string; // llega como string JSON
  user: UsuarioResumen;
}
export interface ProductoPopular {
  productoId: string | null;
  nombre: string;
  vendidos: number;
}
