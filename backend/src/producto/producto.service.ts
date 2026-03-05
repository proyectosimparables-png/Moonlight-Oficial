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
  // 🛠️ UTILIDADES (Slug y Precios)
  // ==========================================

  // 🔹 Generar Slug automáticamente a partir del nombre
  private generarSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita acentos
      .trim()
      .replace(/\s+/g, '-')           // Reemplaza espacios por guiones
      .replace(/[^\w-]+/g, '')        // Quita caracteres especiales (signos, etc)
      .replace(/--+/g, '-');          // Evita guiones dobles
  }

  // 🔹 Formatear precio para vista pública
  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(precio);
  }

  // 🔹 Formatear un producto para el Frontend
  private formatearProducto(producto: any) {
    const imagenesUrls = producto.imagenes?.map((img: any) => img.url) || [];
    return {
      ...producto,
      precio: Number(producto.precio),
      precioPromocional: producto.precioPromocional ? Number(producto.precioPromocional) : null,
      stock: Number(producto.stock || 0),
      published: Boolean(producto.published),
      categoria: producto.categoria || null,
      colores: producto.colores || [],
      talles: producto.talles || [],
      cortes: producto.cortes || [],
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
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.formatearProducto(producto);
  }

  async findBySlug(slug: string) {
    const producto = await this.prisma.producto.findFirst({
      where: {
        slug: slug,
        published: true
      },
      include: {
        imagenes: true,
        categoria: true,
        secciones: { include: { seccion: true } },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }

    return this.formatearProducto(producto);
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
        categoria: true
      },
      take: 10,
    });

    let relatedProducts: any[] = [];
    if (directMatches.length > 0) {
      const categoriaId = directMatches[0].categoriaId;
      const excludeIds = directMatches.map(p => p.id);

      if (categoriaId) {
        relatedProducts = await this.prisma.producto.findMany({
          where: {
            categoriaId: categoriaId,
            id: { notIn: excludeIds },
            published: true,
          },
          include: { imagenes: true },
          take: 6,
        });
      }
    }

    return {
      exactos: this.formatearProductos(directMatches),
      relacionados: this.formatearProductos(relatedProducts)
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return productos.map(p => this.formatearProducto(p));
  }

  async findOneById(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: { include: { parent: true } },
        secciones: { include: { seccion: true } },
        imagenes: true,
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async findAllPublic(seccionId?: string, categoriaId?: string) {
    const where: Prisma.ProductoWhereInput = { published: true };

    if (categoriaId) {
      const idsHijas = await this.getCategoriaYDescendientesIds(categoriaId);
      where.categoriaId = { in: [categoriaId, ...idsHijas] };
    }

    if (seccionId) where.secciones = { some: { seccionId } };

    const productos = await this.prisma.producto.findMany({
      where,
      include: { // Usamos include para traer todo lo necesario para formatearProducto
        imagenes: true,
        categoria: true,
        secciones: { include: { seccion: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // USAMOS LA FUNCIÓN CENTRALIZADA PARA NO REPETIR LÓGICA
    return productos.map(p => this.formatearProducto(p));
  }
  // ==========================================
  // ➕ CREACIÓN (POST)
  // ==========================================

  async create(data: CreateProductoDto, imagenesUrls: string[] = []) {
    // ⚡ Generación automática del slug
    const slugFinal = this.generarSlug(data.nombre);

    const producto = await this.prisma.producto.create({
      data: {
        nombre: data.nombre,
        slug: slugFinal,
        descripcion: data.descripcion,
        precio: data.precio,
        precioPromocional: data.precioPromocional ?? null,
        stock: data.stock ?? 0,
        colores: data.colores ?? [],
        talles: data.talles ?? [],
        cortes: data.cortes ?? [],
        peso: data.peso,
        profundidad: data.profundidad,
        ancho: data.ancho,
        alto: data.alto,
        published: data.published ?? false,
        categoriaId: data.categoriaId,
        secciones: {
          create: data.seccionesIds?.map((seccionId) => ({ seccionId })) || [],
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

  // ==========================================
  // ✏️ ACTUALIZACIÓN (PUT/PATCH)
  // ==========================================

  async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;
    if (file) imagenUrl = await this.cloudinaryService.uploadImage(file);

    const { categoriaId, seccionesIds, talles, colores, ...rest } = data;
    const updateData: any = { ...rest };

    // ⚡ Actualizar slug si el nombre cambia
    if (data.nombre) {
      updateData.slug = this.generarSlug(data.nombre);
    }

    ['precio', 'precioPromocional', 'profundidad', 'ancho', 'alto', 'stock'].forEach(
      (campo) => {
        if (campo in updateData && typeof updateData[campo] === 'string') {
          updateData[campo] = updateData[campo] === '' ? null : parseFloat(updateData[campo]);
        }
      },
    );

    // Manejo especial para el PESO (convertir Kg de input a Gramos de DB)
    if ('peso' in updateData && updateData.peso !== '') {
      // Si viene del frontend como "1.5", lo pasamos a 1500
      const pesoKg = parseFloat(updateData.peso);
      updateData.peso = Math.round(pesoKg * 1000);
    }

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

    if (talles) updateData.talles = Array.isArray(talles) ? { set: talles } : talles;
    if (colores) updateData.colores = Array.isArray(colores) ? { set: colores } : colores;
    if (imagenUrl) updateData.imagenUrl = imagenUrl;

    try {
      return await this.prisma.producto.update({
        where: { id },
        data: updateData,
        include: {
          imagenes: true,
          secciones: true,
          categoria: true
        },
      });
    } catch (error) {
      throw new BadRequestException("No se pudo actualizar el producto.");
    }
  }

  async updateMultipleImages(id: string, data: CreateProductoDto, imagenUrls: string[]) {
    const { seccionesIds, categoriaId, ...rest } = data;
    const productoActual = await this.prisma.producto.findUnique({
      where: { id },
      select: { imagenUrl: true }
    });

    const updateData: any = { ...rest };

    // ⚡ Actualizar slug si el nombre cambia
    if (data.nombre) {
      updateData.slug = this.generarSlug(data.nombre);
    }

    if (categoriaId) updateData.categoria = { connect: { id: categoriaId } };

    if (seccionesIds) {
      const idsArray = Array.isArray(seccionesIds) ? seccionesIds : [seccionesIds];
      updateData.secciones = {
        deleteMany: {},
        create: idsArray.map((sId) => ({ seccionId: sId })),
      };
    }

    if (imagenUrls.length > 0) {
      if (!productoActual?.imagenUrl) updateData.imagenUrl = imagenUrls[0];
      updateData.imagenes = { create: imagenUrls.map((url) => ({ url })) };
    }

    const producto = await this.prisma.producto.update({
      where: { id },
      data: updateData,
      include: {
        imagenes: true,
        secciones: { include: { seccion: true } },
        categoria: true
      },
    });

    return this.formatearProducto(producto);
  }

  // ==========================================
  // 🗑️ ELIMINACIÓN (DELETE)
  // ==========================================

  async remove(id: string) {
    await this.prisma.cartItem.deleteMany({ where: { productoId: id } });
    await this.prisma.favorito.deleteMany({ where: { productoId: id } });

    const producto = await this.prisma.producto.delete({ where: { id } });
    return this.formatearProducto(producto);
  }

  // ==========================================
  // 📁 SECCIONES Y CATEGORÍAS
  // ==========================================

  async getSecciones() {
    const secciones = await this.prisma.seccion.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        productos: {
          include: {
            producto: { include: { imagenes: true } },
          },
        },
      },
    });

    return secciones.map((s) => ({
      ...s,
      productos: s.productos
        .filter((sp) => sp.producto?.published)
        .map((sp) => this.formatearProducto(sp.producto)),
    }));
  }

  async getSeccionConProductos(slug: string) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { slug },
      include: {
        productos: {
          include: {
            producto: { include: { imagenes: true } }
          }
        }
      },
    });

    if (!seccion) return null;

    return {
      ...seccion,
      productos: seccion.productos
        .filter((sp) => sp.producto?.published)
        .map((sp) => this.formatearProducto(sp.producto)),
    };
  }

  async getCategoriasTreePorSeccion(seccionId: string) {
    return await this.prisma.categoria.findMany({
      where: { seccionId, parentId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          include: {
            subcategorias: {
              include: { subcategorias: true },
            },
          },
        },
      },
    });
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
      where: { seccionId, parentId: null },
      orderBy: { nombre: 'asc' },
      include: { subcategorias: { orderBy: { nombre: 'asc' } }, seccion: true },
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
    return this.prisma.seccion.create({ data });
  }

  async actualizarSeccion(id: string, data: Partial<CreateSeccionDto>) {
    return this.prisma.seccion.update({ where: { id }, data });
  }

  async eliminarSeccion(id: string) {
    await this.prisma.seccion.delete({ where: { id } });
    return { message: 'Sección eliminada' };
  }

  // ==========================================
  // 🔐 PRIVADOS / AUXILIARES
  // ==========================================

  private async getCategoriaYDescendientesIds(categoriaId: string): Promise<string[]> {
    const hijos = await this.prisma.categoria.findMany({
      where: { parentId: categoriaId },
      select: { id: true },
    });
    const ids: string[] = [];
    for (const hijo of hijos) {
      ids.push(hijo.id);
      const subIds = await this.getCategoriaYDescendientesIds(hijo.id);
      ids.push(...subIds);
    }
    return ids;
  }

  async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null;
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    return categoria;
  }

  async removeImagen(id: string) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { imagenUrl: null },
    });
    return this.formatearProducto(producto);
  }

  async publicar(id: string) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
    return this.formatearProducto(producto);
  }
}