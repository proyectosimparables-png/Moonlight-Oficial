// punto-entrega.service.ts
import { Injectable } from '@nestjs/common';

import { CreatePuntoEntregaDto } from './dto/create-punto-entrega.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PuntoEntregaService {
  constructor(private prisma: PrismaService) {}

 async crear(data: CreatePuntoEntregaDto) {
  console.log('DATA QUE LLEGA:', data);

  return this.prisma.puntoEntrega.create({
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      localidad: data.localidad,
      disponibilidad: data.disponibilidad,
      costo: data.esDomicilio ? 0 : data.costo,
      esDomicilio: data.esDomicilio ?? false,
      activo: true,
    },
  });
}


  async findAll() {
    return this.prisma.puntoEntrega.findMany({
      where: { activo: true },
    });
  }

  async actualizar(id: string, data: CreatePuntoEntregaDto) {
    return this.prisma.puntoEntrega.update({
      where: { id },
      data,
    });
  }

  async eliminar(id: string) {
    return this.prisma.puntoEntrega.update({
      where: { id },
      data: { activo: false },
    });
  }
}