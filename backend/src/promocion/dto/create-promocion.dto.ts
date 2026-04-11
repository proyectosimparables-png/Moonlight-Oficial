import {
    IsEnum,
    IsNumber,
    IsString,
    IsBoolean,
    IsOptional,
    IsArray,
    IsDateString,
    Min
} from 'class-validator';
import { TipoPromocion } from '@prisma/client';

export class CreatePromocionDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsEnum(TipoPromocion)
    tipo: TipoPromocion;

    @IsNumber()
    @IsOptional()
    @Min(0)
    valor?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    lleva?: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    paga?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    prioridad?: number;

    @IsBoolean()
    @IsOptional()
    acumulable?: boolean;

    @IsBoolean()
    @IsOptional()
    esCombinable?: boolean; // 👈 Agregalo para que coincida con tu Schema

    @IsBoolean()
    @IsOptional()
    activa?: boolean;

    @IsDateString()
    @IsOptional()
    fechaInicio?: string;

    @IsDateString()
    @IsOptional()
    fechaFin?: string;

    // 🚩 Cada array debe llevar sus validadores propios
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    categoriasIds?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    productosIds?: string[];

    // 🚀 AGREGÁ ESTO AQUÍ:
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    seccionesIds?: string[];

}