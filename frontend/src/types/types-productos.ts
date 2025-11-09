export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: {
    id: number;
    nombre: string;
  };
  precio: number;
  stock: number;
  published: boolean;
  imagenUrl?: string;
};

export type CreateProductoDto = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock?: number;
  categoriaId: string;
  seccionId?: string;
};
export interface Favorito {
  id: string;
  productoId: string;
  userId: string;
  createdAt: string;
  producto?: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl?: string;
  };
}
