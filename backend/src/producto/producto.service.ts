/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Injectable()
export class ProductoService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService, // 👈 Inyectamos CloudinaryService
  ) {}

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

  // 🧩 Crear producto (una o varias imágenes)
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

        imagenUrl: imagenesUrls?.[0] ?? null, // la primera imagen principal

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

  // ✏️ Actualizar producto (flexible con o sin imagen)
  async updateProductoFlexible(
    id: string,
    data: CreateProductoDto,
    file?: Express.Multer.File,
  ) {
    let imagenUrl: string | undefined;

    // Si hay imagen, subimos a Cloudinary
    if (file) {
      imagenUrl = await this.cloudinaryService.uploadImage(file);
    }

    const updateData: any = { ...data };
    if (imagenUrl) updateData.imagenUrl = imagenUrl;

    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: updateData,
      include: { imagenes: true },
    });

    return this.formatearProducto(productoActualizado);
  }

  // 🗑 Eliminar producto
  async remove(id: string) {
    const producto = await this.prisma.producto.delete({ where: { id } });
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
      where: { padreId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });
  }

  async getCategoriasPorSeccion(seccionId: string) {
    return this.prisma.categoria.findMany({
      where: { seccionId, padreId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });
  }

  // ➕ Crear categoría
  async crearCategoria(data: { nombre: string; seccionNombre: string; padreId?: string }) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { nombre: data.seccionNombre },
    });

    if (!seccion) {
      throw new Error(`No se encontró la sección con nombre "${data.seccionNombre}"`);
    }

    return this.prisma.categoria.create({
      data: {
        nombre: data.nombre,
        seccionId: seccion.id,
        padreId: data.padreId ?? null,
      },
    });
  }

  // ✏️ Actualizar categoría
  async actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string }) {
    const camposActualizables: any = {};
    if (data.nombre) camposActualizables.nombre = data.nombre;
    if (data.seccionId) camposActualizables.seccionId = data.seccionId;

    if (Object.keys(camposActualizables).length === 0) {
      throw new Error('No se enviaron datos válidos para actualizar');
    }

    return this.prisma.categoria.update({
      where: { id },
      data: camposActualizables,
      include: { seccion: true, subcategorias: true },
    });
  }

  // 🗑 Eliminar categoría
  async eliminarCategoria(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }

  // 🧩 Secciones
  async crearSeccion(data: CreateSeccionDto) {
    return this.prisma.seccion.create({ data });
  }

  async actualizarSeccion(id: string, data: Partial<CreateSeccionDto>) {
    return this.prisma.seccion.update({ where: { id }, data });
  }

  async eliminarSeccion(id: string) {
    return this.prisma.seccion.delete({ where: { id } });
  }

async updateMultipleImages(
  id: string,
  data: CreateProductoDto,
  imagenUrls: string[]
) {
  try {
    console.log('🧾 ID recibido:', id);
    console.log('🧾 ImagenUrls:', imagenUrls);
    console.log('🧾 Data:', data);

    const updateData: any = { ...data };

    // ✅ Conversión segura
    if (typeof updateData.precio === 'string')
      updateData.precio = parseFloat(updateData.precio);
    if (typeof updateData.stock === 'string')
      updateData.stock = parseInt(updateData.stock);

    if (imagenUrls.length > 0) {
      updateData.imagenUrl = imagenUrls[0]; // la principal
      updateData.imagenes = {
        create: imagenUrls.map((url) => ({ url })),
      };
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


}
