import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreatePuntoEntregaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsString()
  @IsNotEmpty({ message: 'La localidad es obligatoria' })
  localidad: string;

  @IsString()
  @IsNotEmpty({ message: 'La disponibilidad es obligatoria' })
  disponibilidad: string;

 @IsNumber()
@Min(0)
@IsOptional()
costo?: number;


  @IsBoolean()
  @IsOptional()
  esDomicilio: boolean; // 👈 Asegúrate de que esta línea esté presente

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}