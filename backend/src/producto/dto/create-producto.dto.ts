import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  // 🧩 Nombre del producto
  @IsString()
  nombre: string;

  // 🧾 Descripción opcional
  @IsOptional()
  @IsString()
  descripcion?: string;

  // 💰 Precio
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number;

  // 📦 Stock (cantidad disponible)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  // 🖼 URL de imagen (opcional)
  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  // 🏷 ID de la categoría (opcional)
  @IsOptional()
  @IsString()
  categoriaId?: string;

  // 🗂 ID de la sección (opcional)
  @IsOptional()
  @IsString()
  seccionId?: string;

  // 📢 Estado de publicación (por defecto: false)
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
