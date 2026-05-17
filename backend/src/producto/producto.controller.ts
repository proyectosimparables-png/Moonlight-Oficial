/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Controller('productos')
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // ==========================================
  // 🛠️ FUNCIÓN PRIVADA DE LIMPIEZA
  // ==========================================
  private parseProductData(body: any) {
    const parsedBody = { ...body };

    if (typeof parsedBody.variantes === 'string') {
      const rawVariantes = JSON.parse(parsedBody.variantes);
      parsedBody.variantes = rawVariantes.map((v: any) => ({
        ...v,
        stock: (v.stock === "" || v.stock === null || v.stock === undefined)
          ? null
          : parseInt(v.stock, 10)
      }));
    }

    if (typeof parsedBody.seccionesIds === 'string') {
      parsedBody.seccionesIds = parsedBody.seccionesIds.split(',').filter(id => id.trim() !== '');
    }
    if (typeof parsedBody.categoriasIds === 'string') {
      parsedBody.categoriasIds = parsedBody.categoriasIds.split(',').filter(id => id.trim() !== '');
    }

    parsedBody.precio = parseFloat(parsedBody.precio) || 0;
    if (parsedBody.peso) parsedBody.peso = Math.round(parseFloat(parsedBody.peso));
    if (parsedBody.ancho) parsedBody.ancho = Math.round(parseFloat(parsedBody.ancho));
    if (parsedBody.alto) parsedBody.alto = Math.round(parseFloat(parsedBody.alto));
    if (parsedBody.profundidad) parsedBody.profundidad = Math.round(parseFloat(parsedBody.profundidad));

    return parsedBody;
  }

  // ==========================================
  // 1. 🔍 LECTURA (PÚBLICO / ADMIN)
  // ==========================================

  @Get()
  findAllPublic(@Query('seccionId') sId?: string, @Query('categoriaId') cId?: string) {
    return this.productoService.findAllPublic(sId, cId);
  }

  // 🌟 NUEVO ENDPOINT OPTIMIZADO PARA MÓNLIGHT
  @Get('secciones/slug/:slug')
  async findSeccionBySlug(@Param('slug') slug: string) {
    const seccion = await this.productoService.findSeccionBySlug(slug);
    if (!seccion) {
      throw new NotFoundException(`La sección con slug '${slug}' no existe`);
    }
    return seccion;
  }

  @Get('admin')
  findAllAdmin(@Query('seccionId') sId?: string, @Query('categoriaId') cId?: string) {
    return this.productoService.findAllAdmin(sId, cId);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim() === '') return [];
    return this.productoService.searchProducts(query.trim());
  }

  @Get('secciones')
  getSecciones() { return this.productoService.getSecciones(); }

  @Get('categorias')
  getCategorias(@Query('seccionId') seccionId?: string) {
    if (!seccionId) return this.productoService.getTodasLasCategorias();
    return this.productoService.getCategoriasPorSeccion(seccionId);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) { return this.productoService.findBySlug(slug); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.productoService.findOne(id); }

  // ==========================================
  // ➕ POST – CREACIÓN
  // ==========================================

  @Post('upload-producto')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadProducto(@UploadedFiles() files: any[], @Body() body: any) {
    const cleanData = this.parseProductData(body);
    const imagenesUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.cloudinaryService.uploadImage(file);
        imagenesUrls.push(url);
      }
    }
    return this.productoService.create(cleanData, imagenesUrls);
  }

  @Post('secciones')
  crearSeccion(@Body() data: CreateSeccionDto) {
    return this.productoService.crearSeccion(data);
  }

  @Post('categorias')
  crearCategoria(@Body() data: { nombre: string; seccionSlug: string; parentId?: string }) {
    return this.productoService.crearCategoria(data);
  }

  // ==========================================
  // ✏️ PUT / PATCH – ACTUALIZACIÓN
  // ==========================================

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateProducto(@Param('id') id: string, @UploadedFiles() files: any[], @Body() body: any) {
    const cleanData = this.parseProductData(body);
    const imagenesNuevas: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.cloudinaryService.uploadImage(file);
        imagenesNuevas.push(url);
      }
    }
    return this.productoService.updateProductoFlexible(id, {
      ...cleanData,
      imagenUrl: imagenesNuevas.length > 0 ? imagenesNuevas[0] : cleanData.imagenUrl,
    });
  }

  @Put('secciones/:id')
  actualizarSeccion(@Param('id') id: string, @Body() data: Partial<CreateSeccionDto>) {
    return this.productoService.actualizarSeccion(id, data);
  }

  @Patch('categorias/:id')
  actualizarCategoria(@Param('id') id: string, @Body() data: { nombre?: string; seccionId?: string }) {
    return this.productoService.actualizarCategoria(id, data);
  }

  @Put(':id/publicar')
  publicar(@Param('id') id: string) { return this.productoService.publicar(id); }

  // ==========================================
  // 🗑 DELETE – ELIMINACIÓN
  // ==========================================

  @Delete('secciones/:id')
  eliminarSeccion(@Param('id') id: string) { return this.productoService.eliminarSeccion(id); }

  @Delete('categorias/:id')
  eliminarCategoria(@Param('id') id: string) { return this.productoService.eliminarCategoria(id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.productoService.remove(id); }
}