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
  ValidationPipe,
  UsePipes,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

import { ProductoService } from './producto.service';

import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Controller('productos')
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // =======================
  // 🔍 GET – PÚBLICO
  // =======================

  @Get()
  findAllPublic(
    @Query('seccionId') seccionId?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.productoService.findAllPublic(seccionId, categoriaId);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim() === '') return [];
    return this.productoService.searchProducts(query.trim());
  }

  @Get('seccion/:slug')
  async getSeccionPorSlug(@Param('slug') slug: string) {
    const seccion = await this.productoService.getSeccionConProductos(slug);
    if (!seccion) {
      throw new NotFoundException(`No se encontró la sección con slug "${slug}"`);
    }
    return seccion;
  }

  // =======================
  // 🔍 GET – ADMIN
  // =======================

  @Get('admin')
  findAllAdmin(
    @Query('seccionId') seccionId?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.productoService.findAllAdmin(seccionId, categoriaId);
  }

  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string) {
    return this.productoService.findOneById(id);
  }

  // =======================
  // 📦 SECCIONES / CATEGORÍAS
  // =======================

  @Get('secciones')
  getSecciones() {
    return this.productoService.getSecciones();
  }

  @Post('secciones')
  crearSeccion(@Body() data: CreateSeccionDto) {
    return this.productoService.crearSeccion(data);
  }

  @Put('secciones/:id')
  actualizarSeccion(
    @Param('id') id: string,
    @Body() data: Partial<CreateSeccionDto>,
  ) {
    return this.productoService.actualizarSeccion(id, data);
  }

  @Delete('secciones/:id')
  eliminarSeccion(@Param('id') id: string) {
    return this.productoService.eliminarSeccion(id);
  }

  @Get('categorias')
  getCategorias(@Query('seccionId') seccionId?: string) {
    if (!seccionId) return this.productoService.getTodasLasCategorias();
    return this.productoService.getCategoriasPorSeccion(seccionId);
  }

  @Get('tree/por-seccion/:seccionId')
  getTreePorSeccion(@Param('seccionId') seccionId: string) {
    return this.productoService.getCategoriasTreePorSeccion(seccionId);
  }
//get para obtener producto por id
@Get(':id') // Esto permite /productos/3d89...
findOne(@Param('id') id: string) {
  return this.productoService.findOne(id);
}

  @Post('categorias')
  crearCategoria(
    @Body() data: { nombre: string; seccionSlug: string; parentId?: string },
  ) {
    return this.productoService.crearCategoria(data);
  }

  @Patch('categorias/:id')
  actualizarCategoria(
    @Param('id') id: string,
    @Body() data: { nombre?: string; seccionId?: string },
  ) {
    return this.productoService.actualizarCategoria(id, data);
  }

  @Delete('categorias/:id')
  eliminarCategoria(@Param('id') id: string) {
    return this.productoService.eliminarCategoria(id);
  }

  // =======================
  // ➕ POST – PRODUCTO
  // =======================

  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  @Post('upload-producto')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadProducto(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductoDto,
  ) {
    if (!files?.length) {
      throw new BadRequestException('Debes subir al menos una imagen');
    }

    const imagenesUrls: string[] = [];
    for (const file of files) {
      imagenesUrls.push(await this.cloudinaryService.uploadImage(file));
    }

    return this.productoService.create(body, imagenesUrls);
  }





  // =======================
  // ✏️ PUT – ADMIN
  // =======================

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProductoDto) {
    return this.productoService.updateProductoFlexible(id, dto);
  }

 @Put(':id/upload')
  @UseInterceptors(FilesInterceptor('files'))
  async updateProductoWithImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductoDto,
  ) {
    const imagenUrls: string[] = [];
    if (files && files.length) {
      for (const file of files) {
        imagenUrls.push(await this.cloudinaryService.uploadImage(file));
      }
    }
    return this.productoService.updateMultipleImages(id, body, imagenUrls);
  }

  @Put(':id/remover-imagen')
  removeImagen(@Param('id') id: string) {
    return this.productoService.removeImagen(id);
  }

  @Put(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.productoService.publicar(id);
  }

  // =======================
  // 🗑 DELETE – ADMIN
  // =======================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }
}
