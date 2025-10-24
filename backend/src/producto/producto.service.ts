import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  // 🧩 Crear producto (con o sin imagen)
async create(data: CreateProductoDto, imagenUrl?: string) {
  return this.prisma.producto.create({
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
}





  // 📦 Listar productos con filtros opcionales
  async findAll(
    published?: boolean,
    seccionId?: string,
    categoriaId?: string,
  ) {
    const where: Prisma.ProductoWhereInput = {};

    if (published !== undefined) where.published = published;
    if (categoriaId) where.categoriaId = categoriaId;
    if (seccionId) where.seccionId = seccionId;

    return this.prisma.producto.findMany({
      where,
      include: {
        categoria: { include: { seccion: true } },
        seccion: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔍 Buscar producto por ID
  async findOne(id: string) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { include: { seccion: true } },
        seccion: true,
      },
    });
  }

  // ✏️ Actualizar producto
  async update(id: string, data: CreateProductoDto, imagenUrl?: string) {
    const updateData: any = { ...data };
    if (imagenUrl) updateData.imagenUrl = imagenUrl;

    return this.prisma.producto.update({
      where: { id },
      data: updateData,
    });
  }

  // 🗑 Eliminar producto
  async remove(id: string) {
    return this.prisma.producto.delete({ where: { id } });
  }

  // 🖼 Quitar imagen del producto
  async removeImagen(id: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { imagenUrl: null },
    });
  }

  // 📢 Publicar producto
  async publicar(id: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
  }

  // Obtener secciones con productos
async getSecciones() {
  return this.prisma.seccion.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      productos: true, // trae los productos de cada sección
    },
  });
}


  // 📚 Obtener TODAS las categorías (sin filtrar)
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

  // 📚 Obtener categorías por sección
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
