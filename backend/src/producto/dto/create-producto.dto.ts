import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  precio: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  // 👇 Array de URLs de imágenes
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  // 👇 Campo para la imagen principal
  @IsOptional()
  @IsString()
  imagenUrl?: string;

  // 👇 Relación con categoría - puedes quitarla si no la necesitas
  @IsOptional()
  @IsString()
  categoriaId?: string;

  // 👇 Relación con la sección
  @IsOptional()
  @IsString()
  seccionId?: string;

  // 👇 Nombre de la sección
  @IsOptional()
  @IsString()
  seccionNombre?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
