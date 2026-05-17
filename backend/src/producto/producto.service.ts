/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Injectable()
export class ProductoService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  // ==========================================
  // 🛠️ UTILIDADES
  // ==========================================

  private generarSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  }

  private formatearProducto(producto: any) {
    if (!producto) return null;
    const imagenesUrls = producto.imagenes?.map((img: any) => img.url) || [];

    const tieneStockInfinito = producto.variantes?.some((v: any) => v.stock === null);
    const stockTotal = tieneStockInfinito
      ? null
      : (producto.variantes?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0);

    return {
      ...producto,
      precio: Number(producto.precio),
      precioPromocional: producto.precioPromocional ? Number(producto.precioPromocional) : null,
      promociones: producto.promociones || [],
      stock: stockTotal,
      published: Boolean(producto.published),
      categoria: producto.categoria || null,
      variantes: producto.variantes || [],
      imagenUrl: producto.imagenUrl || imagenesUrls[0] || "/images/placeholder.png",
      imagenHoverUrl: imagenesUrls[1] || null,
      imagenes: imagenesUrls,
      secciones: producto.secciones?.map((s: any) => s.seccion?.nombre).filter(Boolean) || [],
    };
  }

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }

  // ==========================================
  // 🔍 BÚSQUEDAS (GET)
  // ==========================================

  async findOne(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { include: { parent: true } },
        secciones: { include: { seccion: true } },
        imagenes: true,
        promociones: true,
        variantes: true,
      },
    });

    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return this.formatearProducto(producto);
  }

  async findBySlug(slug: string) {
    const producto = await this.prisma.producto.findFirst({
      where: { slug, published: true },
      include: {
        imagenes: true,
        categoria: true,
        secciones: { include: { seccion: true } },
        promociones: true,
        variantes: true,
      },
    });

    if (!producto) throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    return this.formatearProducto(producto);
  }

  // ⚡ OPTIMIZADO: Consulta directa, limpia y veloz para el catálogo
  async findSeccionBySlug(slug: string) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { slug },
      include: {
        productos: {
          where: { producto: { published: true } }, // El filtro se hace directo en la Base de Datos, no en memoria
          include: {
            producto: {
              include: {
                imagenes: { select: { url: true } }, // Evitamos traer ids o timestamps innecesarios
                variantes: { select: { stock: true, talle: true, color: true, sku: true } },
                categoria: true,
                promociones: true,
              },
            },
          },
        },
      },
    });

    if (!seccion) return null;

    const productosFormateados = seccion.productos
      .map((sp) => this.formatearProducto(sp.producto))
      .filter(Boolean);

    return {
      id: seccion.id,
      nombre: seccion.nombre,
      slug: seccion.slug,
      createdAt: seccion.createdAt,
      updatedAt: seccion.updatedAt,
      productos: productosFormateados,
    };
  }

  async searchProducts(query: string) {
    if (!query) return { exactos: [], relacionados: [] };

    const directMatches = await this.prisma.producto.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
        ],
        published: true,
      },
      include: {
        imagenes: true,
        categoria: true,
        promociones: true,
        variantes: true,
      },
      take: 10,
    });

    return {
      exactos: this.formatearProductos(directMatches),
      relacionados: []
    };
  }

  async findAllAdmin(seccionId?: string, categoriaId?: string) {
    const where: Prisma.ProductoWhereInput = {};
    if (categoriaId) where.categoriaId = categoriaId;
    if (seccionId) where.secciones = { some: { seccionId } };

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        categoria: { include: { parent: true } },
        secciones: { include: { seccion: true } },
        imagenes: true,
        promociones: true,
        variantes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return productos.map(p => this.formatearProducto(p));
  }

  // ⚡ OPTIMIZADO: Eliminamos la recursividad lenta
  async findAllPublic(seccionId?: string, categoriaId?: string) {
    const where: Prisma.ProductoWhereInput = { published: true };

    if (categoriaId) {
      const idsHijas = await this.getCategoriaYDescendientesIds(categoriaId);
      where.categoriaId = { in: [categoriaId, ...idsHijas] };
    }

    if (seccionId) where.secciones = { some: { seccionId } };

    const productos = await this.prisma.producto.findMany({
      where,
      include: {
        imagenes: { select: { url: true } },
        categoria: true,
        secciones: { include: { seccion: true } },
        promociones: true,
        variantes: { select: { stock: true, talle: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return productos.map(p => this.formatearProducto(p));
  }

  // ==========================================
  // ➕ CREACIÓN Y ACTUALIZACIÓN
  // ==========================================

  async create(data: CreateProductoDto, imagenesUrls: string[] = []) {
    const slugFinal = this.generarSlug(data.nombre);
    const pesoGramos = data.peso ? Math.round(Number(data.peso)) : 0;

    const producto = await this.prisma.producto.create({
      data: {
        nombre: data.nombre,
        slug: slugFinal,
        descripcion: data.descripcion,
        precio: data.precio,
        precioPromocional: data.precioPromocional ?? null,
        peso: pesoGramos,
        profundidad: Number(data.profundidad) || 0,
        ancho: Number(data.ancho) || 0,
        alto: Number(data.alto) || 0,
        published: data.published ?? false,
        categoriaId: data.categoriaId,
        secciones: {
          create: data.seccionesIds?.map((seccionId) => ({ seccionId })) || [],
        },
        imagenUrl: imagenesUrls[0] ?? null,
        imagenes: imagenesUrls.length
          ? { create: imagenesUrls.map((url) => ({ url })) }
          : undefined,
        variantes: data.variantes && data.variantes.length > 0
          ? {
            create: data.variantes.map((v) => ({
              talle: v.talle,
              color: v.color,
              stock: (v.stock == null || String(v.stock).trim() === "") ? null : Number(v.stock),
              sku: v.sku,
            })),
          }
          : undefined,
      },
      include: {
        imagenes: true,
        secciones: { include: { seccion: true } },
        categoria: true,
        variantes: true,
      },
    });

    return this.formatearProducto(producto);
  }

  async updateProductoFlexible(id: string, data: any) {
    const { categoriaId, seccionesIds, variantes, ...rest } = data;
    const updateData: any = { ...rest };

    if (data.nombre) updateData.slug = this.generarSlug(data.nombre);

    ['precio', 'precioPromocional', 'profundidad', 'ancho', 'alto', 'peso'].forEach(
      (campo) => {
        if (campo in updateData) {
          updateData[campo] = (updateData[campo] == null || updateData[campo] === '')
            ? 0
            : parseFloat(updateData[campo]);
        }
      },
    );

    if (categoriaId) {
      await this.validarCategoria(categoriaId);
      updateData.categoria = { connect: { id: categoriaId } };
    }

    if (seccionesIds && Array.isArray(seccionesIds)) {
      updateData.secciones = {
        deleteMany: {},
        create: seccionesIds.map((sId: string) => ({ seccionId: sId })),
      };
    }

    if (variantes && Array.isArray(variantes)) {
      updateData.variantes = {
        deleteMany: {},
        create: variantes.map((v: any) => ({
          talle: v.talle,
          color: v.color,
          stock: (v.stock == null || String(v.stock).trim() === "") ? null : Number(v.stock),
          sku: v.sku,
        })),
      };
    }

    try {
      const producto = await this.prisma.producto.update({
        where: { id },
        data: updateData,
        include: {
          imagenes: true,
          secciones: { include: { seccion: true } },
          categoria: true,
          variantes: true
        },
      });
      return this.formatearProducto(producto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("No se pudo actualizar el producto.");
    }
  }

  // ==========================================
  // 🗑️ ELIMINACIÓN Y OTROS
  // ==========================================

  async remove(id: string) {
    const variantes = await this.prisma.variante.findMany({ where: { productoId: id } });
    const variantesIds = variantes.map(v => v.id);

    await this.prisma.cartItem.deleteMany({ where: { varianteId: { in: variantesIds } } });
    await this.prisma.favorito.deleteMany({ where: { productoId: id } });
    await this.prisma.variante.deleteMany({ where: { productoId: id } });

    const producto = await this.prisma.producto.delete({ where: { id } });
    return this.formatearProducto(producto);
  }

  // ⚡ OPTIMIZADO EXTREMO: Para armar menús traemos solo la metadata crucial de secciones. Jamás todo el catálogo.
  async getSecciones() {
    const secciones = await this.prisma.seccion.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        slug: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return secciones.map(s => ({ ...s, productos: [] }));
  }

  async getTodasLasCategorias() {
    return this.prisma.categoria.findMany({
      where: { parentId: null },
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } }, seccion: true },
    });
  }

  async getCategoriasPorSeccion(seccionId: string) {
    return this.prisma.categoria.findMany({
      where: { seccionId },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true
      },
    });
  }

  async crearCategoria(data: { nombre: string; seccionSlug: string; parentId?: string }) {
    const seccion = await this.prisma.seccion.findUnique({ where: { slug: data.seccionSlug } });
    if (!seccion) throw new BadRequestException(`No se encontró la sección con slug "${data.seccionSlug}"`);

    return this.prisma.categoria.create({
      data: { nombre: data.nombre, seccionId: seccion.id, parentId: data.parentId ?? null },
    });
  }

  async actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string; parentId?: string }) {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  async eliminarCategoria(id: string) {
    await this.prisma.categoria.delete({ where: { id } });
    return { message: 'Categoría eliminada' };
  }

  async crearSeccion(data: CreateSeccionDto) {
    return this.prisma.seccion.create({ data: { ...data, slug: this.generarSlug(data.nombre) } });
  }

  async actualizarSeccion(id: string, data: Partial<CreateSeccionDto>) {
    const updateData: any = { ...data };
    if (data.nombre) updateData.slug = this.generarSlug(data.nombre);
    return this.prisma.seccion.update({ where: { id }, data: updateData });
  }

  async eliminarSeccion(id: string) {
    await this.prisma.seccion.delete({ where: { id } });
    return { message: 'Sección eliminada' };
  }

  // ⚡ OPTIMIZADO: Consulta plana en lugar de llamadas secuenciales asíncronas recursivas
  private async getCategoriaYDescendientesIds(categoriaId: string): Promise<string[]> {
    const hijas = await this.prisma.categoria.findMany({
      where: { parentId: categoriaId },
      select: { id: true, subcategorias: { select: { id: true } } },
    });

    const ids: string[] = [];
    for (const hija of hijas) {
      ids.push(hija.id);
      if (hija.subcategorias) {
        ids.push(...hija.subcategorias.map(s => s.id));
      }
    }
    return ids;
  }

  async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null;
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    return categoria;
  }

  async publicar(id: string) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
    return this.formatearProducto(producto);
  }
}