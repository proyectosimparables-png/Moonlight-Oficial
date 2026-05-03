import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Definimos la estructura interna de una variante para validarla
class CreateVarianteDto {
  @IsString()
  talle!: string;

  @IsString()
  color!: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsString()
  sku!: string;
}

export class CreateProductoDto {
  @IsString()
  nombre!: string;

  @IsString()
  descripcion!: string;

  @Type(() => Number)
  @IsNumber()
  precio!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  precioPromocional?: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  // 📦 ENVÍOS
  @Type(() => Number)
  @IsNumber()
  peso!: number;

  @Type(() => Number)
  @IsNumber()
  profundidad!: number;

  @Type(() => Number)
  @IsNumber()
  ancho!: number;

  @Type(() => Number)
  @IsNumber()
  alto!: number;

  @IsString()
  categoriaId!: string;

  // 🔗 SECCIONES
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  seccionesIds!: string[];

  // 🚀 EL CAMPO CLAVE QUE FALTABA: VARIANTES
  @IsOptional()
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVarianteDto)
  variantes?: CreateVarianteDto[];

  @IsOptional()
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  cortes?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

function handleArrayTransform(value: any) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return value ? [value] : [];
    }
  }
  return value || [];
}