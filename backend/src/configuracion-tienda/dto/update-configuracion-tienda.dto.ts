import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionTiendaDto } from './create-configuracion-tienda.dto';

export class UpdateConfiguracionTiendaDto extends PartialType(CreateConfiguracionTiendaDto) {}
