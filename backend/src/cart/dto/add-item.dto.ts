// src/cart/dto/add-item.dto.ts
import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class AddItemDto {
    @IsUUID()
    productoId: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    quantity?: number = 1;
}
