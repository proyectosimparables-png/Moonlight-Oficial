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


  //////////////////////////formateo de productos///////////////////////

  // 🔹 Formatear un producto

private formatearProducto(producto: any) {
   const imagenesUrls = producto.imagenes?.map((img: any) => img.url) || [];
  return {
   
    // Copiamos todas las propiedades básicas (id, nombre, descripcion, stock, etc.)
    ...producto,

    // Mantenemos los precios como NÚMEROS para que el frontend no rompa al hacer cálculos
    precio: Number(producto.precio),
    precioPromocional: producto.precioPromocional ? Number(producto.precioPromocional) : null,
    stock: Number(producto.stock || 0), // Aseguramos que sea número
    published: Boolean(producto.published), // Aseguramos que sea booleano
    
    // IMPORTANTE: Mantenemos la estructura de objeto para que el frontend no rompa
    
    categoria: producto.categoria || null,
    // Aseguramos que los nuevos campos sean siempre arrays, incluso si vienen vacíos
    colores: producto.colores || [],
    talles: producto.talles || [],
    cortes: producto.cortes || [],

    // Manejo de imágenes: extraemos solo las URLs para el frontend
   imagenUrl: producto.imagenUrl || imagenesUrls[0] || "/images/placeholder.png",
    
    // La SEGUNDA imagen para el efecto hover
    imagenHoverUrl: imagenesUrls[1] || null, 

    imagenes: imagenesUrls,
    // Mapeamos las secciones para que el frontend reciba solo los nombres
   secciones: producto.secciones?.map((s: any) => s.seccion?.nombre).filter(Boolean) || [],
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
      // 1. Datos básicos
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      precioPromocional: data.precioPromocional ?? null,
      stock: data.stock ?? 0,

      // 2. Listas de variantes (Colores, Talles, Cortes)
      // Asegúrate de que en tu esquema de Prisma estos campos sean de tipo String[]
      colores: data.colores ?? [],
      talles: data.talles ?? [],
      cortes: data.cortes ?? [],

      // 3. Datos de envío
      peso: data.peso ?? null,
      profundidad: data.profundidad ?? null,
      ancho: data.ancho ?? null,
      alto: data.alto ?? null,

      // 4. Estado y Categoría
      published: data.published ?? false,
      categoriaId: data.categoriaId,

      // 5. Relación MANY-TO-MANY con secciones
      secciones: {
        create: data.seccionesIds?.map((seccionId) => ({
          seccionId,
        })) || [],
      },

      // 6. Manejo de Imágenes
      imagenUrl: imagenesUrls[0] ?? null, // Imagen principal
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



  // 🔍 Buscar productos por nombre o descripción
  async searchProducts(query: string) {
  // Si no hay búsqueda, devolvemos arreglos vacíos de una vez
  if (!query) return { exactos: [], relacionados: [] };

  // 1. Búsqueda directa (Corregido: Quitamos la duplicación)
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

  // 2. Búsqueda de productos relacionados
  let relatedProducts: any[] = [];

  if (directMatches.length > 0) {
    // Tomamos la categoría del primer resultado para buscar similares
    const categoriaId = directMatches[0].categoriaId;
    
    // Guardamos los IDs que ya encontramos para no repetirlos en "relacionados"
    const excludeIds = directMatches.map(p => p.id);

    if (categoriaId) {
      relatedProducts = await this.prisma.producto.findMany({
        where: {
          categoriaId: categoriaId,
          id: { notIn: excludeIds }, // No mostrar lo que ya está en exactos
          published: true,
        },
        include: { imagenes: true },
        take: 6,
      });
    }
  }

  // 3. Retornamos ambos grupos formateados
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
      categoria: { 
        include: { parent: true } // Trae el padre para armar el path "Ropa > Remeras"
      },
      secciones: { 
        include: { seccion: true } 
      },
      imagenes: true,
    },
    orderBy: { createdAt: 'desc' },
    
  });

  // IMPORTANTE: Pasarlos por el formateador para normalizar precios y arrays
  return productos.map(p => this.formatearProducto(p));
}

 async findOneById(id: string) {
  const producto = await this.prisma.producto.findUnique({
    where: { id },
    include: {
      // Unificamos todo en un solo bloque de include
      categoria: { 
        include: { parent: true } 
      },
      secciones: { 
        include: { seccion: true } 
      },
      imagenes: true,
    },
  });

  if (!producto) {
    throw new NotFoundException('Producto no encontrado');
  }

  return producto;
}
 

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



  async findAllPublic(seccionId?: string, categoriaId?: string) {
    const where: Prisma.ProductoWhereInput = { published: true };

    if (categoriaId) {
      const idsHijas = await this.getCategoriaYDescendientesIds(categoriaId);
      where.categoriaId = { in: [categoriaId, ...idsHijas] };
    }

    if (seccionId) where.secciones = { some: { seccionId } };

    // OPTIMIZACIÓN: Usamos select para traer SOLO lo que necesita la card del producto
    const productos = await this.prisma.producto.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        precio: true,
        precioPromocional: true,
        imagenUrl: true,
        categoriaId: true,
        // Si usas una imagen secundaria para el hover, inclúyela aquí:
        imagenes: {
          take: 2,
          select: { url: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formateamos los precios a String con "$"
    return productos.map(p => ({
      ...p,
      precio: this.formatearPrecio(p.precio),
      precioPromocional: p.precioPromocional ? this.formatearPrecio(p.precioPromocional) : null,
      imagenHoverUrl: p.imagenes?.[1]?.url || null,
      imagenes: p.imagenes?.map(img => img.url) || []
    }));
  }

  // ✏️ Actualizar producto
  async updateProductoFlexible(id: string, data: any, file?: Express.Multer.File) {
  let imagenUrl: string | undefined;
  if (file) imagenUrl = await this.cloudinaryService.uploadImage(file);

  // 1. Extraemos campos especiales
  const { categoriaId, seccionesIds, talles, colores, ...rest } = data;
  const updateData: any = { ...rest };

  // 2. Conversión de números
  ['precio', 'precioPromocional', 'peso', 'profundidad', 'ancho', 'alto', 'stock'].forEach(
    (campo) => {
      if (campo in updateData && typeof updateData[campo] === 'string') {
        updateData[campo] = updateData[campo] === '' ? null : parseFloat(updateData[campo]);
      }
    },
  );

  // 3. Categoría
  if (categoriaId) {
    await this.validarCategoria(categoriaId);
    updateData.categoria = { connect: { id: categoriaId } };
  }

  // 4. Secciones (Many-to-Many)
  if (seccionesIds && Array.isArray(seccionesIds)) {
    updateData.secciones = {
      deleteMany: {},
      create: seccionesIds.map((sId: string) => ({ seccionId: sId })),
    };
  }

  // 5. Talles y Colores (Ajusta 'set' según cómo esté tu Prisma)
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
    console.error("Error al actualizar:", error);
    throw new BadRequestException("No se pudo actualizar el producto.");
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
    return await this.prisma.categoria.findMany({
      where: { seccionId, parentId: null },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: { // Nivel 1: Remeras
          include: {
            subcategorias: { // Nivel 2: BTS
              include: {
                subcategorias: true, // Nivel 3: RM, Jimin, etc.
              },
            },
          },
        },
      },
    });
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



  
///slug recien agregado////////////////////////////###########
  async getSeccionConProductos(slug: string) {
  const seccion = await this.prisma.seccion.findUnique({
    where: { slug },
    include: {
      productos: {
        include: {
          producto: {
            include: { imagenes: true } // 👈 ¡Fundamental para el hover!
          }
        }
      }
    },
  });

  if (!seccion) return null;

  // Formateamos para que el frontend reciba el objeto "limpio"
  return {
    ...seccion,
    productos: seccion.productos
      .filter((sp) => sp.producto?.published) // Solo publicados
      .map((sp) => this.formatearProducto(sp.producto)), // 👈 Aquí aplicas tu formateo
  };
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
