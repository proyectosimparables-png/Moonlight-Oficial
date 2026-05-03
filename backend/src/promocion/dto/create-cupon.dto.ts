import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsDateString,
    Min
} from 'class-validator';
import { TipoDescuento } from '@prisma/client';

export class CreateCuponDto {
    @IsString()
    codigo!: string; // Ej: "MOONLIGHT10"

    @IsEnum(TipoDescuento)
    tipo!: TipoDescuento; // PORCENTAJE, MONTO_FIJO o ENVIO_GRATIS

    @IsNumber()
    @Min(0)
    valor!: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    limiteUso?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minimoCarrito?: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;

    @IsBoolean()
    @IsOptional()
    acumulable?: boolean;

    @IsBoolean()
    @IsOptional()
    soloPrimeraCompra?: boolean;

    @IsDateString()
    @IsOptional()
    fechaInicio?: string;

    @IsDateString()
    @IsOptional()
    fechaFin?: string;
}