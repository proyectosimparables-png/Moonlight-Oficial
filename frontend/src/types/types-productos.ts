// types/types-productos.ts

export type SeccionType = {
  id: string;
  nombre: string;
};

export type CategoriaType = {
  id: string;
  nombre: string;
  parent?: CategoriaType | null;
};

// 1. EL NÚCLEO: La Variante
// Esta es la representación de la fila en tu tabla de Variantes (Prisma)
export type Variante = {
  id: string;
  productoId: number;
  talle: string;
  color: string;
  stock: number | null; // null = infinito
};

// 2. PRODUCTO PARA EL FRONTEND
// Lo que consume DetailsProducts
export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  published: boolean;
  imagenUrl?: string;
  imagenes: string[]; // Simplificado a array de strings para las URLs
  categoria?: {
    id: string;
    nombre: string;
  };
  secciones?: SeccionType[];

  // Datos derivados para los selectores
  talles: string[];
  colores: string[];

  // Relación completa con variantes
  variantes: Variante[];
};

// 3. RESPUESTA DEL BACKEND (NidJS + Prisma)
// Refleja exactamente cómo vienen los datos del include de Prisma
export type ProductoBackend = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  published: boolean;
  imagenUrl: string | null;
  imagenHoverUrl: string | null;
  categoria?: CategoriaType | null;
  secciones: {
    seccion: SeccionType;
  }[];
  imagenes: { url: string }[];
  variantes: Variante[]; // Fundamental para el stock por talle/color
};

// 4. PARA FORMULARIOS Y CREACIÓN
export type ProductoForm = {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  seccionIds: string[];
  published: boolean;
  imagenUrl?: string;
  imagenes: { url: string }[];
};

export type CreateProductoDto = {
  nombre: string;
  descripcion: string;
  precio: number;
  categoriaId: string;
  seccionIds?: string[];
  // Las variantes suelen enviarse como un array aparte al crear
  variantes?: {
    talle: string;
    color: string;
    stock: number | null;
  }[];
};

// 5. FAVORITOS
export interface Favorito {
  id: string;
  productoId: number; // Cambiado a number para coincidir con Producto.id
  userId: string;
  producto?: {
    id: number;
    nombre: string;
    precio: number;
    imagenUrl: string;
    imagenHoverUrl?: string | null;
    imagenes: string[];
  };
}