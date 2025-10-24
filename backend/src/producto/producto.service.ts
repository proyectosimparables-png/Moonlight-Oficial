// src/producto/producto.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductoService {
  constructor(private prisma: PrismaService) {}

  // Crear producto con imagen
  async create(data: CreateProductoDto, imagenUrl?: string) {
    return this.prisma.producto.create({
      data: {
        ...data,
        categoriaId: data.categoriaId!,
        tipoPrendaId: data.tipoPrendaId!,
        imagenUrl: imagenUrl ?? null,
        stock: data.stock ?? 0,
      },
    });
  }

  // Listar todos los productos
  async findAll(
    published?: boolean,
    seccionId?: string,
    categoriaId?: string,
    tipoPrendaId?: string,
  ) {
    const where: Prisma.ProductoWhereInput = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (seccionId) {
      where.categoria = {
        seccionId: seccionId,
      };
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (tipoPrendaId) {
      where.tipoPrendaId = tipoPrendaId;
    }

    return this.prisma.producto.findMany({
      where,
      include: {
        categoria: {
          include: {
            seccion: true,
          },
        },
        tipoPrenda: true,
      },
    });
  }

  // Buscar producto por ID
  async findOne(id: string) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: {
          include: {
            seccion: true,
          },
        },
        tipoPrenda: true,
      },
    });
  }

  // Actualizar producto
 async update(id: string, data: CreateProductoDto, imagenUrl?: string) {
  const updateData: any = {
    ...data,
  };

  if (imagenUrl) {
    updateData.imagenUrl = imagenUrl;
  }

  return this.prisma.producto.update({
    where: { id },
    data: updateData,
  });
}


  // Eliminar producto
  async remove(id: string) {
    return this.prisma.producto.delete({ where: { id } });
  }
  async removeImagen(id: string) {
  return this.prisma.producto.update({
    where: { id },
    data: { imagenUrl: null },
  });
}


  // Publicar producto
  async publicar(id: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { published: true },
    });
  }

  // Obtener secciones
  async getSecciones() {
    try {
      console.log('ProductoService.getSecciones ejecutado');
      const secciones = await this.prisma.seccion.findMany({
        orderBy: { nombre: 'asc' },
      });
      console.log('Secciones obtenidas:', secciones);
      return secciones;
    } catch (error) {
      console.error('Error en getSecciones:', error);
      throw error;
    }
  }

  // ✅ Obtener TODAS las categorías (sin filtrar)
async getTodasLasCategorias() {
  try {
    const categorias = await this.prisma.categoria.findMany({
      where: {
        padreId: null, 
      },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          orderBy: { nombre: 'asc' },
        },
        seccion: true,
      },
    });
    return categorias;
  } catch (error) {
    console.error('Error en getTodasLasCategorias:', error);
    throw error;
  }
}

// ✅ Obtener categorías por sección
async getCategoriasBySeccion(seccionId: string) {
  try {
    const categorias = await this.prisma.categoria.findMany({
      where: {
        seccionId,
        padreId: null,
      },
      orderBy: { nombre: 'asc' },
      include: {
        subcategorias: {
          orderBy: { nombre: 'asc' },
        },
        seccion: true,
      },
    });
    return categorias;
  } catch (error) {
    console.error('Error en getCategoriasBySeccion:', error);
    throw error;
  }
}



// Eliminar categoría
async eliminarCategoria(id: string) {
  try {
    return await this.prisma.categoria.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error;
  }
}

/// ✅ Actualizar categoría con validaciones y logs
async actualizarCategoria(id: string, data: { nombre?: string; seccionId?: string }) {
  try {
    const camposActualizables: any = {};
    if (data.nombre) camposActualizables.nombre = data.nombre;
    if (data.seccionId) camposActualizables.seccionId = data.seccionId;

    if (Object.keys(camposActualizables).length === 0) {
      throw new Error('No se enviaron datos válidos para actualizar');
    }

    const categoriaActualizada = await this.prisma.categoria.update({
      where: { id },
      data: camposActualizables,
      include: { seccion: true, subcategorias: true },
    });

    return categoriaActualizada;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error;
  }
}




  // Obtener tipos de prenda
  async getTiposPrenda() {
    try {
      console.log('ProductoService.getTiposPrenda ejecutado');
      const tipos = await this.prisma.tipoPrenda.findMany({
        orderBy: { nombre: 'asc' },
      });
      console.log('Tipos de prenda obtenidos:', tipos);
      return tipos;
    } catch (error) {
      console.error('Error en getTiposPrenda:', error);
      throw error;
    }
  }

// Eliminar un tipo de prenda
async eliminarTipoPrenda(id: string) {
  return this.prisma.tipoPrenda.delete({
    where: { id },
  });
}

// Actualizar tipo de prenda
async actualizarTipoPrenda(id: string, data: { nombre?: string }) {
  return this.prisma.tipoPrenda.update({
    where: { id },
    data,
  });
}


async getTiposPrendaConCategoriasYProductos() {
  const tipos = await this.prisma.tipoPrenda.findMany({
    include: {
      categorias: {
        include: {
          productos: true, // Necesario para contar productos por categoría
        },
      },
    },
  });

  // Mapeamos para devolver solo los datos necesarios
  return tipos.map(tipo => ({
    id: tipo.id,
    nombre: tipo.nombre,
    categorias: tipo.categorias.map(cat => ({
      id: cat.id,
      nombre: cat.nombre,
    })),
    productoCount: tipo.categorias.reduce(
      (acc, cat) => acc + cat.productos.length,
      0
    ),
  }));
}

// ✅ Crear nueva categoría a partir del nombre de la sección
async crearCategoria(data: { nombre: string; seccionNombre: string; padreId?: string }) {
  try {
    const seccion = await this.prisma.seccion.findUnique({
      where: { nombre: data.seccionNombre },
    });

    if (!seccion) {
      throw new Error(`No se encontró la sección con nombre "${data.seccionNombre}"`);
    }

    return await this.prisma.categoria.create({
      data: {
        nombre: data.nombre,
        seccionId: seccion.id,
        padreId: data.padreId ?? null,
      },
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
}



// ✅ Crear nuevo tipo de prenda
async crearTipoPrenda(data: { nombre: string }) {
  try {
    return await this.prisma.tipoPrenda.create({
      data: {
        nombre: data.nombre,
      },
    });
  } catch (error) {
    console.error('Error al crear tipo de prenda:', error);
    throw error;
  }
}






}










