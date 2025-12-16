/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
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

  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  }

  private formatearProducto(producto: any) {
    return {
      ...producto,
      precio: this.formatearPrecio(producto.precio),
      precioPromocional: producto.precioPromocional
        ? this.formatearPrecio(producto.precioPromocional)
        : null,
    };
  }

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }

  // 🧩 Crear producto
  async create(data: CreateProductoDto, imagenesUrls: string[] = []) {
    const producto = await this.prisma.producto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        precioPromocional: data.precioPromocional ?? null,
        stock: data.stock ?? 0,
        peso: data.peso ?? null,
        profundidad: data.profundidad ?? null,
        ancho: data.ancho ?? null,
        alto: data.alto ?? null,
        published: data.published ?? false,
        categoriaId: data.categoriaId,
        secciones: {
          create: data.seccionesIds.map((seccionId) => ({
            seccionId,
          })),
        },
        imagenUrl: imagenesUrls[0] ?? null,
        imagenes: imagenesUrls.length
          ? { create: imagenesUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: {
        imagenes: true,
        secciones: { include: { seccion: true } },
        categoria: true,
      },
    });

    return this.formatearProducto(producto);
  }

  formatearProductoImd(producto: any) {
    return {
      ...producto,
      imagenes: producto.imagenes?.map((img) => img.url) || [],
    };
  }

  async findAll(
    published?: boolean,
    seccionId?: string,
    categoriaId?: string,
  ) {
    const where: Prisma.ProductoWhereInput = {};
    if (published !== undefined) where.published = published;
    if (categoriaId) where.categoriaId = categoriaId;
    if (seccionId) {
      where.secciones = { some: { seccionId } };
    }

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        categoria: true,
        secciones: { include: { seccion: true } },
        imagenes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.formatearProductos(productos);
  }

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

  async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;
    if (file) imagenUrl = await this.cloudinaryService.uploadImage(file);

    const updateData: any = { ...data };
    if (!updateData.categoriaId) updateData.categoriaId = null;
    if (!updateData.seccionId) updateData.seccionId = null;
    if (typeof updateData.precio === 'string') updateData.precio = parseFloat(updateData.precio);
    if (typeof updateData.precioPromocional === 'string')
      updateData.precioPromocional = updateData.precioPromocional === '' ? null : parseFloat(updateData.precioPromocional);
    if (typeof updateData.stock === 'string') updateData.stock = parseInt(updateData.stock);
    if (typeof updateData.peso === 'string') updateData.peso = updateData.peso === '' ? null : parseFloat(updateData.peso);
    if (typeof updateData.profundidad === 'string') updateData.profundidad = updateData.profundidad === '' ? null : parseInt(updateData.profundidad);
    if (typeof updateData.ancho === 'string') updateData.ancho = updateData.ancho === '' ? null : parseInt(updateData.ancho);
    if (typeof updateData.alto === 'string') updateData.alto = updateData.alto === '' ? null : parseInt(updateData.alto);

    if (updateData.categoriaId) await this.validarCategoria(updateData.categoriaId);

    if (imagenUrl) updateData.imagenUrl = imagenUrl;

    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: updateData,
      include: { imagenes: true },
    });

    return this.formatearProducto(productoActualizado);
  }

  // Métodos de eliminar, publicar, secciones, categorías, etc. siguen igual
  // ...

  async crearCategoria(data: { nombre: string; seccionSlug: string; parentId?: string }) {
    const seccion = await this.prisma.seccion.findUnique({ where: { slug: data.seccionSlug } });
    if (!seccion) throw new Error(`No se encontró la sección con slug "${data.seccionSlug}"`);

    return this.prisma.categoria.create({
      data: {
        nombre: data.nombre,
        seccionId: seccion.id,
        parentId: data.parentId ?? null,
      },
    });
  }
}
