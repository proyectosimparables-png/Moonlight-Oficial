/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Injectable()
export class ProductoService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  // 🔹 Formatear precio
  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  }

  // 🔹 Formatear un producto
  private formatearProducto(producto: any) {
    return {
      ...producto,
      precio: this.formatearPrecio(producto.precio),
    };
  }

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }

  // 🧩 Crear producto
  async create(data: CreateProductoDto, imagenesUrls?: string[]) {
    const producto = await this.prisma.producto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock ?? 0,
        categoriaId: data.categoriaId,
        seccionId: data.seccionId,
        published: data.published ?? false,
        imagenUrl: imagenesUrls?.[0] ?? null,
        imagenes: imagenesUrls?.length
          ? { create: imagenesUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: { imagenes: true },
    });

    return this.formatearProducto(producto);
  }

  // 📝 Formatear producto con imágenes
  formatearProductoImd(producto: any) {
    return {
      ...producto,
      imagenes: producto.imagenes?.map((img) => img.url) || [],
    };
  }

  // 📦 Listar productos
  async findAll(published?: boolean, seccionId?: string, categoriaId?: string) {
    const where: Prisma.ProductoWhereInput = {};
    if (published !== undefined) where.published = published;
    if (categoriaId) where.categoriaId = categoriaId;
    if (seccionId) where.seccionId = seccionId;

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        categoria: { include: { seccion: true } },
        seccion: true,
        imagenes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.formatearProductos(productos);
  }

  // 🔍 Buscar producto por ID
  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { include: { seccion: true } },
        seccion: true,
        imagenes: true,
      },
    });
    if (!producto) return null;
    return this.formatearProducto(producto);
  }

  // 🔍 Buscar productos por nombre o descripción (versión definitiva)
  async searchProducts(query: string) {
    if (!query) return [];

    const productos = await this.prisma.producto.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
        ],
        published: true,
      },
      include: {
        categoria: { include: { seccion: true } },
        seccion: true,
        imagenes: true,
      },
      take: 10,
    });

    return this.formatearProductos(productos);
  }

  // ✏️ Actualizar producto (flexible con o sin imagen)
  async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;

    if (file) {
      imagenUrl = await this.cloudinaryService.uploadImage(file);
    }

    const updateData: any = { ...data };

    if (updateData.categoriaId === '' || updateData.categoriaId === undefined)
      updateData.categoriaId = null;

    if (updateData.seccionId === '' || updateData.seccionId === undefined)
      updateData.seccionId = null;

    if (typeof updateData.precio === 'string')
      updateData.precio = parseFloat(updateData.precio);

    if (typeof updateData.stock === 'string')
      updateData.stock = parseInt(updateData.stock);

    if (updateData.categoriaId) {
      await this.validarCategoria(updateData.categoriaId);
    }

    if (updateData.seccionId) {
      const seccion = await this.prisma.seccion.findUnique({
        where: { id: updateData.seccionId },
      });
      if (!seccion) {
        throw new BadRequestException('La sección no existe');
      }
    }

    if (imagenUrl) {
      updateData.imagenUrl = imagenUrl;
    }

    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: updateData,
      include: { imagenes: true },
    });

    return this.formatearProducto(productoActualizado);
  }

  // 🗑 Eliminar producto
  async remove(id: string) {
    await this.prisma.cartItem.deleteMany({
      where: { productoId: id },
    });

    const producto = await this.prisma.producto.delete({
      where: { id },
    });

    return this.formatearProducto(producto);
  }

  // 🖼 Quitar imagen principal
  async removeImagen(id: string) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { imagenUrl: null },
    });
    return this.formatearProducto(producto);
  }

  // 📢 Publicar producto
  async publicar(id: string) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
    return this.formatearProducto(producto);
  }

  // 📁 Secciones con productos
  async getSecciones() {
    const secciones = await this.prisma.seccion.findMany({
      orderBy: { nombre: 'asc' },
      include: { productos: true },
    });

    return secciones.map((s) => ({
      ...s,
      productos: this.formatearProductos(s.productos),
    }));
  }

  // 📚 Categorías
  async getTodasLasCategorias() {
    return this.prisma.categoria.findMany({
      where: { parentId: null },
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } }, seccion: true },
    });
  }

  async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null;

    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    }

    return categoria;
  }

  async getCategoriasPorSeccion(seccionId: string) {
    return this.prisma.categoria.findMany({
      where: { seccionId, parentId: null },
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } }, seccion: true },
    });
  }

  async crearCategoria(data: { nombre: string; seccionSlug: string; parentId?: string }) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { slug: data.seccionSlug },
    });

    if (!seccion) {
      throw new Error(`No se encontró la sección con slug "${data.seccionSlug}"`);
    }

    return this.prisma.categoria.create({
      data: {
        nombre: data.nombre,
        seccionId: seccion.id,
        parentId: data.parentId ?? null,
      },
    });
  }

  async actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string }) {
    const camposActualizables: any = {};
    if (data.nombre) camposActualizables.nombre = data.nombre;
    if (data.seccionId) camposActualizables.seccionId = data.seccionId;

    if (Object.keys(camposActualizables).length === 0)
      throw new Error('No se enviaron datos válidos para actualizar');

    return this.prisma.categoria.update({
      where: { id },
      data: camposActualizables,
      include: { seccion: true, subcategorias: true },
    });
  }

  async eliminarCategoria(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }

  async crearSeccion(data: CreateSeccionDto) {
    return this.prisma.seccion.create({ data });
  }

  async actualizarSeccion(id: string, data: Partial<CreateSeccionDto>) {
    return this.prisma.seccion.update({ where: { id }, data });
  }

  async eliminarSeccion(id: string) {
    return this.prisma.seccion.delete({ where: { id } });
  }

  // 🔄 Actualizar múltiples imágenes
  async updateMultipleImages(
    id: string,
    data: CreateProductoDto,
    imagenUrls: string[],
  ) {
    try {
      const updateData: any = { ...data };

      if ('categoriaId' in updateData) {
        if (!updateData.categoriaId) {
          updateData.categoriaId = null;
        } else {
          await this.validarCategoria(updateData.categoriaId);
        }
      }

      if ('seccionId' in updateData) {
        if (!updateData.seccionId) {
          updateData.seccionId = null;
        } else {
          const seccion = await this.prisma.seccion.findUnique({
            where: { id: updateData.seccionId },
          });
          if (!seccion) {
            throw new BadRequestException(
              `La sección con ID ${updateData.seccionId} no existe`,
            );
          }
        }
      }

      if (typeof updateData.precio === 'string')
        updateData.precio = parseFloat(updateData.precio);
      if (typeof updateData.stock === 'string')
        updateData.stock = parseInt(updateData.stock);

      if (imagenUrls.length > 0) {
        updateData.imagenUrl = imagenUrls[0];
        updateData.imagenes = {
          create: imagenUrls.map((url) => ({ url })),
        };
      } else {
        delete updateData.imagenUrl;
        delete updateData.imagenes;
      }

      const producto = await this.prisma.producto.update({
        where: { id },
        data: updateData,
        include: { imagenes: true },
      });

      return this.formatearProducto(producto);
    } catch (error) {
      console.error('❌ Error en updateMultipleImages:', error);
      throw error;
    }
  }

  // 🔹 Obtener sección por slug (publicada)
  async getSeccionConProductos(slug: string) {
    return this.prisma.seccion.findUnique({
      where: { slug },
      include: {
        productos: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            imagenUrl: true,
          },
        },
      },
    });
  }
}
