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
    // Extraemos las URLs del array de objetos de Prisma
    imagenes: producto.imagenes?.map((img: any) => img.url) || []
  };
}

  private formatearProductos(productos: any[]) {
    return productos.map((p) => this.formatearProducto(p));
  }


// 📦 Obtener un solo producto por ID
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

  // Importante: Formateamos el producto antes de enviarlo para que el precio sea un string con "$"
  return this.formatearProducto(producto);
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

 
  // 🔍 Buscar productos por nombre o descripción
async searchProducts(query: string) {
  if (!query) return { exactos: [], relacionados: [] };

  // 1. Búsqueda directa
  const directMatches = await this.prisma.producto.findMany({
    where: {
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { descripcion: { contains: query, mode: 'insensitive' } },
      ],
      published: true,
    },
    include: { imagenes: true, categoria: true },
    take: 10,
  });

  // 2. CORRECCIÓN DEL ERROR: Definimos el tipo explícitamente como 'any[]'
  let relatedProducts: any[] = []; 

  if (directMatches.length > 0) {
    // Tomamos la categoría del primer resultado para buscar similares
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


  // 📦 Listar productos
 async findOneById(id: string) {
  const producto = await this.prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: { include: { parent: true } }, // Incluimos parent para el path
      secciones: { include: { seccion: true } }, // <--- VITAL
      imagenes: true,
    },
  });

  if (!producto) throw new NotFoundException('Producto no encontrado');
  return producto; 
}

async findAllAdmin(seccionId?: string, categoriaId?: string) {
  const where: Prisma.ProductoWhereInput = {};
  if (categoriaId) where.categoriaId = categoriaId;
  if (seccionId) where.secciones = { some: { seccionId } };

  return this.prisma.producto.findMany({
    where,
    include: {
      categoria: { include: { parent: true } },
      secciones: { include: { seccion: true } }, // <--- VITAL para ps.seccion.nombre
      imagenes: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async findAllPublic(seccionId?: string, categoriaId?: string) {
  const where: Prisma.ProductoWhereInput = { published: true };
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

  // Solo formateamos para la vista pública (donde no se edita)
  return this.formatearProductos(productos);
}


  // ✏️ Actualizar producto
 async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
  let imagenUrl: string | undefined;
  if (file) imagenUrl = await this.cloudinaryService.uploadImage(file);

  // 1. Extraemos los campos que NO van directamente en el 'data' de Prisma
  const { categoriaId, seccionesIds, ...rest } = data;
  const updateData: any = { ...rest };

  // 2. Convertimos strings a números (tu lógica actual)
  ['precio', 'precioPromocional', 'peso', 'profundidad', 'ancho', 'alto', 'stock'].forEach(
    (campo) => {
      if (campo in updateData && typeof updateData[campo] === 'string') {
        updateData[campo] = updateData[campo] === '' ? null : parseFloat(updateData[campo]);
      }
    },
  );

  // 3. Manejamos la relación de CATEGORÍA
  if (categoriaId) {
    await this.validarCategoria(categoriaId);
    updateData.categoria = {
      connect: { id: categoriaId }
    };
  }

  // 4. Manejamos la relación MANY-TO-MANY de SECCIONES
  if (seccionesIds && Array.isArray(seccionesIds)) {
    updateData.secciones = {
      // Primero borramos las relaciones anteriores para este producto
      deleteMany: {},
      // Creamos las nuevas relaciones
      create: seccionesIds.map((sId: string) => ({
        seccionId: sId,
      })),
    };
  }

  if (imagenUrl) updateData.imagenUrl = imagenUrl;

  // 5. Ejecutamos el update con el objeto formateado correctamente para Prisma
  try {
    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: updateData,
      include: { 
        imagenes: true,
        secciones: true,
        categoria: true 
      },
    });

    return productoActualizado;

  } catch (error) {
    console.error("Error al actualizar en Prisma:", error);
    throw new BadRequestException("No se pudo actualizar el producto. Revisa los IDs de relación.");
  }
}

 
 // 🗑 Eliminar producto
async remove(id: string) {
  // 1. Borrar referencias en el Carrito
  await this.prisma.cartItem.deleteMany({ 
    where: { productoId: id } 
  });

  // 2. Borrar referencias en Favoritos (ESTO ES LO QUE FALTA)
  await this.prisma.favorito.deleteMany({ 
    where: { productoId: id } 
  });

  // 3. Ahora sí, borrar el producto
  const producto = await this.prisma.producto.delete({ 
    where: { id } 
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
          producto: {
            include: { imagenes: true } // 👈 VITAL: Si no pones esto, imagenes viene vacío
          },
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

//Categirias con sus secciones de raiz

async getCategoriasTreePorSeccion(seccionId: string) {
  // 1. Validación de seguridad
  if (!seccionId || seccionId === 'undefined' || seccionId === 'null') {
    console.warn("Se intentó buscar categorías con un seccionId inválido");
    return [];
  }

  try {
    return await this.prisma.categoria.findMany({
      where: {
        seccionId: seccionId,
        parentId: null, 
      },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          include: {
            subcategorias: {
              include: {
                subcategorias: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error en Prisma al traer el árbol:", error);
    throw new Error("Error interno al obtener categorías");
  }
}

  // 🔄 Actualizar múltiples imágenes
async updateMultipleImages(id: string, data: CreateProductoDto, imagenUrls: string[]) {
  const { seccionesIds, categoriaId, ...rest } = data;
  
  // 1. Buscamos el producto actual para saber si ya tiene una imagen principal
  const productoActual = await this.prisma.producto.findUnique({
    where: { id },
    select: { imagenUrl: true }
  });

  const updateData: any = { ...rest };

  if (categoriaId) {
    updateData.categoria = { connect: { id: categoriaId } };
  }

  if (seccionesIds) {
    const idsArray = Array.isArray(seccionesIds) ? seccionesIds : [seccionesIds];
    updateData.secciones = {
      deleteMany: {},
      create: idsArray.map((sId) => ({ seccionId: sId })),
    };
  }

  // 2. Lógica para AGREGAR imágenes sin reemplazar
  if (imagenUrls.length > 0) {
    // Si el producto NO tiene imagen principal, le ponemos la primera que subimos ahora
    if (!productoActual?.imagenUrl) {
      updateData.imagenUrl = imagenUrls[0];
    }

    // Usamos 'create' dentro de 'imagenes', pero Prisma lo añadirá a la lista existente 
    // siempre y cuando no uses 'set' o 'deleteMany' en la relación de imágenes.
    updateData.imagenes = {
      create: imagenUrls.map((url) => ({ url })),
    };
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

      async validarCategoria(categoriaId: string) {
    if (!categoriaId) return null;
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException(`La categoría con ID ${categoriaId} no existe`);
    return categoria;
  }

 

  async crearSeccion(data: CreateSeccionDto) {
    return this.prisma.seccion.create({ data });
  }


  

  async getSeccionConProductos(slug: string) {
    return this.prisma.seccion.findUnique({
      where: { slug },
      include: { productos: { include: { producto: true } } },
    });
  }


  // ⚡ Métodos que faltaban en tu controller
  async actualizarSeccion(id: string, data: Partial<CreateSeccionDto>) {
    return this.prisma.seccion.update({ where: { id }, data });
  }

  async eliminarSeccion(id: string) {
    await this.prisma.seccion.delete({ where: { id } });
    return { message: 'Sección eliminada' };
  }

  async actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string; parentId?: string }) {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  async eliminarCategoria(id: string) {
    await this.prisma.categoria.delete({ where: { id } });
    return { message: 'Categoría eliminada' };
  }
}
