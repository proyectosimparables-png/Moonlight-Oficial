// types/productos.ts

export type SeccionType = {
  id: string;
  nombre: string;
};

export type CategoriaType = {
  id: string;
  nombre: string;
  parent?: CategoriaType | null;
  seccionId?: string | null; // 💡 ¡TIP EXTRA! Agregalo acá también si querés que la categoría sepa a qué sección pertenece
};

// 1. EL NÚCLEO: La Variante
export type Variante = {
  id: string;
  productoId: number;
  talle: string;
  color: string;
  stock: number | null; // null = infinito
};

// 2. PRODUCTO PARA EL FRONTEND
export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioPromocional?: number | null; // 💡 ¡Ojo! Agregamos el promocional que usás en el form
  published: boolean;
  imagenUrl?: string;
  imagenes: string[];
  categoria?: {
    id: string;
    nombre: string;
  };
  secciones?: SeccionType[];

  // 📦 DATOS DE LOGÍSTICA PARA CORREO ARGENTINO
  peso: number;
  alto: number;
  ancho: number;
  profundidad: number; // o 'largo' según tu BD

  // Datos derivados para los selectores
  talles: string[];
  colores: string[];
  variantes: Variante[];
};

// 3. RESPUESTA DEL BACKEND (NestJS + Prisma)
// ⚠️ ACÁ ES DONDE SÍ O SÍ TIENEN QUE ESTAR PARA QUE VIAJEN EN LA API
export type ProductoBackend = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioPromocional?: number | null; // 💡 También acá
  published: boolean;
  imagenUrl: string | null;
  imagenHoverUrl: string | null;
  categoria?: CategoriaType | null;
  secciones: {
    seccion: SeccionType;
  }[];
  imagenes: { url: string }[];
  variantes: Variante[];

  // 📦 DATOS DE LOGÍSTICA (Asegurate que se llamen igual en tu Schema de Prisma)
  peso: number;
  alto: number;
  ancho: number;
  profundidad: number;
};

// 4. PARA FORMULARIOS Y CREACIÓN
export type ProductoForm = {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  precioPromocional?: string; // Para el input
  categoriaId: string;
  seccionIds: string[];
  published: boolean;
  imagenUrl?: string;
  imagenes: { url: string }[];

  // 📦 DATOS DE LOGÍSTICA PARA LOS INPUTS
  peso: string;
  alto: string;
  ancho: string;
  profundidad: string;
};

export type CreateProductoDto = {
  nombre: string;
  descripcion: string;
  precio: number;
  precioPromocional?: number | null;
  categoriaId: string;
  seccionIds?: string[];
  variantes?: {
    talle: string;
    color: string;
    stock: number | null;
  }[];

  // 📦 DATOS DE LOGÍSTICA EN EL DTO
  peso: number;
  alto: number;
  ancho: number;
  profundidad: number;
};

// 5. FAVORITOS
export interface Favorito {
  id: string;
  productoId: number;
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