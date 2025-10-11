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
    tipoPrendaId: string;
    seccionId?: string;
  };    
  