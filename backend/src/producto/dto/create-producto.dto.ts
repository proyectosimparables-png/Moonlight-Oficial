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

  @Transform(({ value }) => {
  // 1. Si ya es un array, lo devolvemos tal cual
  if (Array.isArray(value)) return value;
  
  // 2. Si es un string, intentamos ver si es un JSON (como "[1,2]") 
  // o si es un ID simple "123"
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // Si no es JSON (es un ID simple), lo metemos en un array
      return [value];
    }
  }
  return value;
})
@IsArray()
seccionesIds: string[];

  @IsOptional()
  published?: boolean;
}
