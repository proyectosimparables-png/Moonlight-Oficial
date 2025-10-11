// src/producto/producto.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  // Crear producto con imagen
  async create(data: CreateProductoDto, imagenUrl?: string) {
    return this.prisma.producto.create({
      data: {
        ...data,
        categoriaId: data.categoriaId!,
        tipoPrendaId: data.tipoPrendaId!,
        imagenUrl: imagenUrl ?? null,
        stock: data.stock ?? 0,
      },
    });
  }

  // Listar todos los productos
  async findAll(
    published?: boolean,
    seccionId?: string,
    categoriaId?: string,
    tipoPrendaId?: string,
  ) {
    const where: Prisma.ProductoWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (seccionId) {
      where.categoria = {
        seccionId: seccionId,
      };
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (tipoPrendaId) {
      where.tipoPrendaId = tipoPrendaId;
    }

    return this.prisma.producto.findMany({
      where,
      include: {
        categoria: {
          include: {
            seccion: true,
          },
        },
        tipoPrenda: true,
      },
    });
  }

  // Buscar producto por ID
  async findOne(id: string) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: {
          include: {
            seccion: true,
          },
        },
        tipoPrenda: true,
      },
    });
  }

  // Actualizar producto
 async update(id: string, data: CreateProductoDto, imagenUrl?: string) {
  const updateData: any = {
    ...data,
  };

  if (imagenUrl) {
    updateData.imagenUrl = imagenUrl;
  }

  return this.prisma.producto.update({
    where: { id },
    data: updateData,
  });
}


  // Eliminar producto
  async remove(id: string) {
    return this.prisma.producto.delete({ where: { id } });
  }
  async removeImagen(id: string) {
  return this.prisma.producto.update({
    where: { id },
    data: { imagenUrl: null },
  });
}


  // Publicar producto
  async publicar(id: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
  }

  // Obtener secciones
  async getSecciones() {
    try {
      console.log('ProductoService.getSecciones ejecutado');
      const secciones = await this.prisma.seccion.findMany({
        orderBy: { nombre: 'asc' },
      });
      console.log('Secciones obtenidas:', secciones);
      return secciones;
    } catch (error) {
      console.error('Error en getSecciones:', error);
      throw error;
    }
  }

  // Obtener categorías por sección
  async getCategoriasBySeccion(seccionId: string) {
    try {
      console.log('ProductoService.getCategoriasBySeccion ejecutado con seccionId =', seccionId);
      const categorias = await this.prisma.categoria.findMany({
        where: { seccionId },
        orderBy: { nombre: 'asc' },
      });
      console.log('Categorías obtenidas:', categorias);
      return categorias;
    } catch (error) {
      console.error('Error en getCategoriasBySeccion:', error);
      throw error;
    }
  }

  // Obtener tipos de prenda
  async getTiposPrenda() {
    try {
      console.log('ProductoService.getTiposPrenda ejecutado');
      const tipos = await this.prisma.tipoPrenda.findMany({
        orderBy: { nombre: 'asc' },
      });
      console.log('Tipos de prenda obtenidos:', tipos);
      return tipos;
    } catch (error) {
      console.error('Error en getTiposPrenda:', error);
      throw error;
    }
  }
}
