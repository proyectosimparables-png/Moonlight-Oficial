import { Type } from 'class-transformer';

import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsBoolean,
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

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  seccionId?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}