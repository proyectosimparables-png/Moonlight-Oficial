// src/cart/dto/add-item.dto.ts
import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class AddItemDto {
    @IsUUID()
    productoId!: string;

    // AGREGAR ESTO:
    @IsUUID()
    @IsString()
    varianteId!: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1;
}