import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsString()
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  precio: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  precioPromocional?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  stock?: number;

  // 📦 ENVÍOS
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  peso?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  profundidad?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  ancho?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  alto?: number;

  @IsString()
  categoriaId: string;

  // 👇 porque llega como JSON string desde FormData
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  seccionesIds: string[];

  @IsOptional()
  published?: boolean;
}
