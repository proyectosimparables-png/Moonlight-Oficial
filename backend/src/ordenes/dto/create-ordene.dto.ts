import { IsString, IsNumber, IsOptional, IsUUID, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { EstadoOrden, MetodoPago } from '@prisma/client';

export class CreateOrdeneDto {
    @IsUUID()
    userId: string;

    // Datos de Contacto y Destinatario
    @IsEmail()
    emailContacto: string;

    @IsString()
    @IsNotEmpty()
    nombreDestinatario: string;

    @IsString()
    @IsNotEmpty()
    apellidoDestinatario: string;

    @IsString()
    @IsNotEmpty()
    dniDestinatario: string;

    @IsString()
    @IsNotEmpty()
    telefonoDestinatario: string;

    // Datos de Envío
    @IsString()
    @IsNotEmpty()
    metodoEnvio: string; // Ej: "Correo Argentino Clásico"

    @IsNumber()
    costoEnvio: number;

    @IsString()
    @IsNotEmpty()
    codigoPostal: string;

    @IsString()
    @IsNotEmpty()
    provincia: string;

    @IsString()
    @IsNotEmpty()
    localidad: string;

    @IsString()
    @IsNotEmpty()
    calle: string;

    @IsString()
    @IsNotEmpty()
    numero: string;

    @IsOptional()
    @IsString()
    piso?: string;

    @IsOptional()
    @IsString()
    departamento?: string;

    @IsOptional()
    @IsString()
    notasEntrega?: string;

    // Pago
    @IsEnum(MetodoPago)
    metodoPago: MetodoPago;

@IsEnum(EstadoOrden)
  nuevoEstado: EstadoOrden;

}