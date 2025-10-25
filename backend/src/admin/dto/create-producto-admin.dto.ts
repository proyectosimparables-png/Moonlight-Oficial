import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class CreateProductoAdminDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  precio: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsString()
  tipoPrendaId: string; // ✅ Usamos el ID directamente

  @IsString()
  categoriaId: string; // ✅ Campo requerido por Prisma
}
