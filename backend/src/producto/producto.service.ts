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
      precioPromocional: producto.precioPromocional
        ? this.formatearPrecio(producto.precioPromocional)
        : null,
    };
  }

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }

  // 🧩 Crear producto (una o varias imágenes)
 async create(data: CreateProductoDto, imagenesUrls: string[] = []) {
  const producto = await this.prisma.producto.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      precioPromocional: data.precioPromocional ?? null,
      stock: data.stock ?? 0,

      // Envíos
      peso: data.peso ?? null,
      profundidad: data.profundidad ?? null,
      ancho: data.ancho ?? null,
      alto: data.alto ?? null,

      published: data.published ?? false,

      categoriaId: data.categoriaId,

      // 👇 relación MANY TO MANY con secciones
      secciones: {
        create: data.seccionesIds.map((seccionId) => ({
          seccionId,
        })),
      },

      imagenUrl: imagenesUrls[0] ?? null,

      imagenes: imagenesUrls.length
        ? {
            create: imagenesUrls.map((url) => ({ url })),
          }
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



  // 📝 Formatear producto con imágenes
  formatearProductoImd(producto: any) {
    return {
      ...producto,
      imagenes: producto.imagenes?.map((img) => img.url) || [],
    };
  }

  // 📦 Listar productos
  async findAll(
    published?: boolean,
    seccionId?: string,
    categoriaId?: string,
  ) {
    const where: Prisma.ProductoWhereInput = {};
    if (published !== undefined) where.published = published;
    if (categoriaId) where.categoriaId = categoriaId;
    if (seccionId) where.secciones = { some: { seccionId } };

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

  // 🔍 Buscar productos por nombre o descripción
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
      include: { categoria: { include: { seccion: true } }, secciones: true, imagenes: true },
      take: 10,
    });
    return this.formatearProductos(productos);
  }

  // ✏️ Actualizar producto
  async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;
    if (file) imagenUrl = await this.cloudinaryService.uploadImage(file);

    const updateData: any = { ...data };

    ['precio', 'precioPromocional', 'peso', 'profundidad', 'ancho', 'alto', 'stock'].forEach(
      (campo) => {
        if (campo in updateData && typeof updateData[campo] === 'string') {
          updateData[campo] = updateData[campo] === '' ? null : parseFloat(updateData[campo]);
        }
      },
    );

    if (updateData.categoriaId) await this.validarCategoria(updateData.categoriaId);

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
    await this.prisma.cartItem.deleteMany({ where: { productoId: id } });
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
  include: {
      productos: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              precioPromocional: true,
              imagenUrl: true,
              published: true,
            },
          },
        },
      },
    },
    });
  
 return secciones.map((s) => ({
   ...s,
   productos: this.formatearProductos(s.productos),
 }));
 }
//Categirias con sus secciones de raiz

async getCategoriasTreePorSeccion(seccionId: string) {
  return this.prisma.categoria.findMany({
    where: {
      seccionId,
      parentId: null, // 👈 solo raíces (Remeras, Abrigos)
    },
    orderBy: { nombre: 'asc' },
    include: {
      subcategorias: {
        orderBy: { nombre: 'asc' },
        include: {
          subcategorias: {
            orderBy: { nombre: 'asc' },
            include: {
              subcategorias: true, // 👈 preparado para más niveles
            },
          },
        },
      },
    },
  });
}









  // 📚 Categorías
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
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });
  }

  // ➕ Crear categoría
  async crearCategoria(data: { nombre: string; seccionSlug: string; padreId?: string }) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { slug: data.seccionSlug },
    });

    if (!seccion) {
      throw new Error(`No se encontró la sección con slug "${data.seccionSlug}"`);
    }

    return this.prisma.categoria.create({
      data: { nombre: data.nombre, seccionId: seccion.id, parentId: data.padreId ?? null },
    });
  }

  async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null;
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    return categoria;
  }

  
  async crearSeccion(data: CreateSeccionDto) {
    return this.prisma.seccion.create({ data });
  }

  

  // ⚡ Métodos que faltaban en tu controller
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
     console.log("🔥 updateMultipleImages ejecutado");
    try {
      const updateData: any = { ...data };

      // VALIDACIÓN CATEGORÍA
      if ('categoriaId' in updateData) {
        if (!updateData.categoriaId) {
          updateData.categoriaId = null;
        } else {
          await this.validarCategoria(updateData.categoriaId);
        }
      }

      // VALIDACIÓN SECCIÓN
      if ('seccionId' in updateData) {
        if (!updateData.seccionId) {
          updateData.seccionId = null;
        } else {
          const seccion = await this.prisma.seccion.findUnique({
            where: { id: updateData.seccionId },
          });
          if (!seccion) {
            throw new BadRequestException(
              `La sección con ID ${updateData.seccionId} no existe`
            );
          }
        }
      }

      // Conversión segura
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
        // ❗ NO tocamos la imagen principal ni las imágenes anteriores
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



  // 🔹 Obtener una sección por slug (con todos sus productos publicados)

  async getSeccionConProductos(slug: string) {
  return this.prisma.seccion.findUnique({
    where: { slug },
    include: {
      productos: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              precioPromocional: true,
              imagenUrl: true,
              published: true,
            },
          },
        },
      },
    },
  });
}









}






