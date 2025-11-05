// src/producto/dto/create-seccion.dto.ts
import { IsString } from 'class-validator';

export class CreateSeccionDto {
  @IsString()
  nombre: string;
}
