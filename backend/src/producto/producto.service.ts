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
        seccionId: data.seccionId!,
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
  ) {
    const where: Prisma.ProductoWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (seccionId) {
      where.categoria = { seccionId };
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    return this.prisma.producto.findMany({
      where,
      include: {
        categoria: { include: { seccion: true } },
      },
    });
  }

  // Buscar producto por ID
  async findOne(id: string) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { include: { seccion: true } },
      },
    });
  }

  // Actualizar producto
  async update(id: string, data: CreateProductoDto, imagenUrl?: string) {
    const updateData: any = { ...data };
    if (imagenUrl) updateData.imagenUrl = imagenUrl;

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
    return this.prisma.seccion.findMany({ orderBy: { nombre: 'asc' } });
  }

  // Obtener categorías por sección
  async getCategoriasBySeccion(seccionId: string) {
    return this.prisma.categoria.findMany({
      where: { seccionId, padreId: null },
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } } },
    });
  }

  // Eliminar categoría
  async eliminarCategoria(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }

  // Actualizar categoría
  async actualizarCategoria(
    id: string,
    data: { nombre?: string; seccionId?: string },
  ) {
    return this.prisma.categoria.update({ where: { id }, data });
  }
}
