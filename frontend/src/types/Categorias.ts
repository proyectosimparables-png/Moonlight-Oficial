export interface Categoria {
  id: string;
  nombre: string;
  subcategorias?: Categoria[];
}
