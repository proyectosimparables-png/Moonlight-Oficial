import { IsEnum } from 'class-validator';
import { EstadoOrden } from '@prisma/client';

export class UpdateOrdenStatusDto {
  @IsEnum(EstadoOrden, {
    message: 'El estado debe ser uno de los valores permitidos (EMPAQUETADO, ENVIADO, etc.)',
  })
  nuevoEstado: EstadoOrden;
}