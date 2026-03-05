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
  peso: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  profundidad: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  ancho: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  alto: number;

  @IsString()
  categoriaId: string;

  // 🎨 NUEVOS CAMPOS: COLORES, TALLES, CORTES
  @IsOptional()
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  colores?: string[];

  @IsOptional()
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  talles?: string[];

  @IsOptional()
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  cortes?: string[];

  // 🔗 SECCIONES
  @Transform(({ value }) => handleArrayTransform(value))
  @IsArray()
  seccionesIds: string[];

  @IsOptional()
  published?: boolean;
}

/**
 * Función auxiliar para limpiar la lógica de transformación repetida
 */
function handleArrayTransform(value: any) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // Si llega como un string simple (ej: "blanco"), lo convertimos a ["blanco"]
      return value ? [value] : [];
    }
  }
  return value || [];
}