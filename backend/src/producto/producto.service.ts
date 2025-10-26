/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) { }

  // 🔹 Función privada para formatear precio
  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  }

  // 🔹 Función privada para formatear productos
  private formatearProducto(producto: any) {
    return {
      ...producto,
      precio: this.formatearPrecio(producto.precio),
    };
  }

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }

  // 🧩 Crear producto (con o sin imagen)
  async create(data: CreateProductoDto, imagenUrl?: string) {
    const producto = await this.prisma.producto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock ?? 0,
        imagenUrl: imagenUrl,
        categoriaId: data.categoriaId,
        seccionId: data.seccionId,
        published: data.published ?? false,
      } as Prisma.ProductoUncheckedCreateInput,
    });

    return this.formatearProducto(producto);
  }

  // 📦 Listar productos con filtros opcionales
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
      },
    });

    if (!producto) return null;

    return this.formatearProducto(producto);
  }

  // ✏️ Actualizar producto
  async update(id: string, data: CreateProductoDto, imagenUrl?: string) {
    const updateData: any = { ...data };
    if (imagenUrl) updateData.imagenUrl = imagenUrl;

    const producto = await this.prisma.producto.update({
      where: { id },
      data: updateData,
    });

    return this.formatearProducto(producto);
  }

  // 🗑 Eliminar producto
  async remove(id: string) {
    const producto = await this.prisma.producto.delete({ where: { id } });
    return this.formatearProducto(producto);
  }

  // 🖼 Quitar imagen del producto
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

  // Obtener secciones con productos
  async getSecciones() {
    const secciones = await this.prisma.seccion.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        productos: true,
      },
    });

    // Formatear los precios de los productos en cada sección
    return secciones.map((s) => ({
      ...s,
      productos: this.formatearProductos(s.productos),
    }));
  }

  // 📚 Obtener TODAS las categorías (sin filtrar)
  async getTodasLasCategorias() {
    const categorias = await this.prisma.categoria.findMany({
      where: { padreId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });

    // Formatear productos de cada categoría si los incluyes más adelante
    return categorias;
  }

  // 📚 Obtener categorías por sección
  async getCategoriasPorSeccion(seccionId: string) {
    const categorias = await this.prisma.categoria.findMany({
      where: { seccionId, padreId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });

    return categorias;
  }

  // ➕ Crear nueva categoría
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
}
