export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  secciones?: any[];
  talles: string[];
  colores: string[];
  cortes: string[];
  categoria: {
    id: string;
    nombre: string;
  };
  precio: number;
  stock: number;
  published: boolean;
  imagenUrl?: string;
  imagenes?: { url: string }[];

};

export type SeccionType = {
  id: string;
  nombre: string;
};

export type CategoriaType = {
  id: string;
  nombre: string;
  parent?: CategoriaType | null;
};

export type ProductoBackend = {
  id: number;
  nombre: string;
  descripcion: string;
  imagenUrl: string | null;
  imagenHoverUrl: string | null;
  secciones: {
    seccion: SeccionType;
  }[];
  categoria?: CategoriaType | null;
  precio: number;
  stock: number;
  published: boolean;
  imagenes: { url: string }[];

};


export type ProductoForm = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  published: boolean;
  imagenUrl?: string;
  imagenes?: { url: string }[];
  categoria?: {
    id: string;
    nombre: string;
  };
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
  producto?: {
    id: string;
    nombre: string;
    precio: number;
    imagenUrl: string;
    imagenHoverUrl?: string | null; // Agrega esta línea
    imagenes: string[];
  };
}
