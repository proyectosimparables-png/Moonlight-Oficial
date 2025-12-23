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
    private cloudinaryService: CloudinaryService, // 👈 Inyectamos CloudinaryService
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
  // Como tu esquema solo permite UNA categoría, tomamos la última del array 
  // (que suele ser la subcategoría más profunda: RM, Jungkook, etc.)
  const categoriasIds = Array.isArray(data.categoriaId) ? data.categoriaId: [];
  const categoriaFinalId = categoriasIds.length > 0 
    ? categoriasIds[categoriasIds.length - 1] 
    : null;

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

      // USAMOS EL CAMPO CORRECTO SEGÚN TU SCHEMA: categoriaId
      categoriaId: categoriaFinalId,

      // Relación Many-to-Many con Secciones (ProductoSeccion)
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
      categoria: true, // "categoria" en singular como tu schema
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

  // 👇 FILTRO POR SECCIÓN (many-to-many)
  if (seccionId) {
    where.secciones = {
      some: {
        seccionId,
      },
    };
  }

  const productos = await this.prisma.producto.findMany({
    where,
    include: {
      categoria: true,
      secciones: {
        include: {
          seccion: true,
        },
      },
      imagenes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return this.formatearProductos(productos);
}

  async search(q: string) {
    return this.prisma.producto.findMany({
      where: {
        OR: [
          { id: { contains: q, mode: 'insensitive' } },
          { nombre: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        categoria: true,
        imagenes: true,
      },
      take: 10,
    });
  }



  // ✏️ Actualizar producto (flexible con o sin imagen)
 async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
  console.log("🔥 updateProductoFlexible ejecutado");

  let imagenUrl: string | undefined;

  // Si hay imagen nueva → subirla
  if (file) {
    imagenUrl = await this.cloudinaryService.uploadImage(file);
  }

  const updateData: any = { ...data };

  // ------------------------------------
  // 🛠 FIX 1 — Convertir strings vacíos a null
  // ------------------------------------
  if (updateData.categoriaId === "" || updateData.categoriaId === undefined)
    updateData.categoriaId = null;

  if (updateData.seccionId === "" || updateData.seccionId === undefined)
    updateData.seccionId = null;

  // ------------------------------------
  // 🛠 FIX 2 — Convertir precio / stock si vienen como string
  // ------------------------------------
  if (typeof updateData.precio === "string")
    updateData.precio = parseFloat(updateData.precio);

  if (typeof updateData.stock === "string")
    updateData.stock = parseInt(updateData.stock);
// ------------------------------------
// 🛠 FIX 2.1 — Convertir promo / peso / dimensiones
// ------------------------------------
if (typeof updateData.precioPromocional === "string")
  updateData.precioPromocional = updateData.precioPromocional === ""
    ? null
    : parseFloat(updateData.precioPromocional);

if (typeof updateData.peso === "string")
  updateData.peso = updateData.peso === "" ? null : parseFloat(updateData.peso);

if (typeof updateData.profundidad === "string")
  updateData.profundidad = updateData.profundidad === "" ? null : parseInt(updateData.profundidad);

if (typeof updateData.ancho === "string")
  updateData.ancho = updateData.ancho === "" ? null : parseInt(updateData.ancho);

if (typeof updateData.alto === "string")
  updateData.alto = updateData.alto === "" ? null : parseInt(updateData.alto);
  // ------------------------------------
  // 🛠 FIX 3 — Validar categoría si existe
  // ------------------------------------
  if (updateData.categoriaId) {
    await this.validarCategoria(updateData.categoriaId);
  }

  // ------------------------------------
  // 🛠 FIX 4 — Validar sección si existe
  // ------------------------------------
  if (updateData.seccionId) {
    const seccion = await this.prisma.seccion.findUnique({
      where: { id: updateData.seccionId },
    });

    if (!seccion) {
      throw new BadRequestException("La sección no existe");
    }
  }

  // ------------------------------------
  // 🛠 FIX 5 — Agregar imagen principal si llegó nueva
  // ------------------------------------
  if (imagenUrl) {
    updateData.imagenUrl = imagenUrl;
  }

  // ------------------------------------
  // 🔥 Finalmente: Actualizar
  // ------------------------------------
  const productoActualizado = await this.prisma.producto.update({
    where: { id },
    data: updateData,
    include: { imagenes: true },
  });

  return this.formatearProducto(productoActualizado);
}


  // 🗑 Eliminar producto
  async remove(id: string) {
    // 🧹 Borrar primero los cartItems asociados
    await this.prisma.cartItem.deleteMany({
      where: { productoId: id },
    });

    // 🗑 Ahora sí borrar el producto
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
  include: {
    productos: {
      include: {
        producto: true,
      },
    },
  },
});

return secciones.map((s) => ({
  ...s,
  productos: s.productos
    .filter(p => p.producto && p.producto.published)
    .map(p => this.formatearProducto(p.producto)),
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
      include: {
        subcategorias: { orderBy: { nombre: 'asc' } },
        seccion: true,
      },
    });
  }
  // 🚀 Servicio de Categoría (categoria.service.ts)
  async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null; // permite null porque tu modelo lo soporta

    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    }

    return categoria;
  }


 // En producto.service.ts
async getCategoriasPorSeccion(seccionId: string) {
  return await this.prisma.categoria.findMany({
    where: {
      seccionId: seccionId,
      parentId: null, // 🔥 IMPORTANTE: Solo traemos las raíces para empezar el árbol
    },
    include: {
      subcategorias: {
        include: {
          subcategorias: true, // 🔥 Esto trae el tercer nivel (RM, Jungkook, etc.)
        },
      },
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
      data: {
        nombre: data.nombre,
        seccionId: seccion.id,
        parentId: data.padreId ?? null,
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
 // En producto.service.ts
async getSeccionConProductos(slug: string) {
  const seccion = await this.prisma.seccion.findUnique({
    where: { slug },
    include: {
      productos: {
        include: {
          producto: true, // Esto trae la data real del producto
        },
      },
    },
  });

  if (!seccion) return null;

  // IMPORTANTE: Mapeamos para que el objeto sea plano y el frontend lo entienda
  const productosFormateados = seccion.productos
    .filter(item => item.producto && item.producto.published) // Solo publicados
    .map(item => {
      // Usamos tu función de formateo existente para el precio
      return this.formatearProducto(item.producto);
    });

  return {
    ...seccion,
    productos: productosFormateados,
  };
}
}










