/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  Query,
  UseInterceptors,
  UploadedFiles,
  ValidationPipe,
  UsePipes,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Controller('productos')
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // =======================
  // 🔍 GET
  // =======================

  @Get('secciones')
  getSecciones() {
    return this.productoService.getSecciones();
  }

  @Get('seccion/:slug')
  async getSeccionPorSlug(@Param('slug') slug: string) {
    const seccion = await this.productoService.getSeccionConProductos(slug);
    if (!seccion) {
      throw new NotFoundException(`No se encontró la sección con slug "${slug}"`);
    }
    return seccion;
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

  @Get()
  findAll(
    @Query('published') published?: string,
    @Query('seccionId') seccionId?: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    const isPublished =
      published === 'true' ? true : published === 'false' ? false : undefined;
    return this.productoService.findAll(isPublished, seccionId, categoriaId);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.trim() === '') return [];
    return this.productoService.searchProducts(query.trim());
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const producto = await this.productoService.findById(id, {
      include: {
        categoria: true,
        imagenes: true,
        secciones: { include: { seccion: true } },
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  // =======================
  // ➕ POST
  // =======================

  @Post('secciones')
  crearSeccion(@Body() data: CreateSeccionDto) {
    return this.productoService.crearSeccion(data);
  }

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
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes subir al menos una imagen');
    }

    const imagenesUrls: string[] = [];
    for (const file of files) {
      const url = await this.cloudinaryService.uploadImage(file);
      imagenesUrls.push(url);
    }

    return this.productoService.create(body, imagenesUrls);
  }

  @Post('categorias')
  crearCategoria(
    @Body() data: { nombre: string; seccionSlug: string; parentId?: string },
  ) {
    return this.productoService.crearCategoria(data);
  }

  // =======================
  // ✏️ PUT
  // =======================

  @Put('secciones/:id')
  actualizarSeccion(
    @Param('id') id: string,
    @Body() data: Partial<CreateSeccionDto>,
  ) {
    return this.productoService.actualizarSeccion(id, data);
  }

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
  // ✏️ PATCH
  // =======================

  @Patch('categorias/:id')
  actualizarCategoria(
    @Param('id') id: string,
    @Body() data: { nombre?: string; seccionId?: string },
  ) {
    return this.productoService.actualizarCategoria(id, data);
  }

  // =======================
  // 🗑 DELETE
  // =======================

  @Delete('secciones/:id')
  eliminarSeccion(@Param('id') id: string) {
    return this.productoService.eliminarSeccion(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }

  @Delete('categorias/:id')
  eliminarCategoria(@Param('id') id: string) {
    return this.productoService.eliminarCategoria(id);
  }
}
