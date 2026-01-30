import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateOrdeneDto {
    @IsUUID()
    userId: string;

    @IsString()
    @IsOptional()
    metodoEnvio?: string;

    @IsNumber()
    @IsOptional()
    costoEnvio?: number;

    @IsString()
    @IsOptional()
    direccionEnvio?: string;
}