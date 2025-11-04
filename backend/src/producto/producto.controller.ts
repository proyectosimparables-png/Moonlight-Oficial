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
  UploadedFile,
  UploadedFiles,
  ValidationPipe,
  UsePipes,
  BadRequestException,
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
  ) {}

  // =======================
  // 🔍 GET
  // =======================

  // Obtener secciones
  @Get('secciones')
  getSecciones() {
    return this.productoService.getSecciones();
  }

  // Obtener categorías (todas o por sección)
  @Get('categorias')
  getCategorias(@Query('seccionId') seccionId?: string) {
    if (!seccionId) return this.productoService.getTodasLasCategorias();
    return this.productoService.getCategoriasPorSeccion(seccionId);
  }

  // Obtener todos los productos
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

  // Obtener producto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  // =======================
  // ➕ POST
  // =======================

  // Crear nueva sección
  @Post('secciones')
  crearSeccion(@Body() data: CreateSeccionDto) {
    return this.productoService.crearSeccion(data);
  }

  // Crear producto (sin imagen)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  // 📸 Crear producto con imágenes
  @Post('upload-producto')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadProducto(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductoDto,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('Debes subir al menos una imagen');

    const imagenesUrls: string[] = [];
    for (const file of files) {
      const url = await this.cloudinaryService.uploadImage(file);
      imagenesUrls.push(url);
    }

    const productoCreado = await this.productoService.create(
      {
        ...body,
        seccionId: body.seccionId ? String(body.seccionId) : undefined,
        categoriaId: body.categoriaId ? String(body.categoriaId) : undefined,
      },
      imagenesUrls,
    );

    return productoCreado;
  }

  // Crear categoría
  @Post('categorias')
  crearCategoria(
    @Body() data: { nombre: string; seccionNombre: string; padreId?: string },
  ) {
    return this.productoService.crearCategoria(data);
  }

  // =======================
  // ✏️ PUT
  // =======================

  // Actualizar sección
  @Put('secciones/:id')
  actualizarSeccion(
    @Param('id') id: string,
    @Body() data: Partial<CreateSeccionDto>,
  ) {
    return this.productoService.actualizarSeccion(id, data);
  }

  // Actualizar producto (sin imagen)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProductoDto) {
    return this.productoService.updateProductoFlexible(id, dto);
  }

  // 📸 Actualizar producto (con una nueva imagen)
 @Put(':id/upload')
@UseInterceptors(FilesInterceptor('files'))
async updateProductoWithImages(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: CreateProductoDto
) {
  const imagenUrls: string[] = [];
  if (files && files.length) {
    for (const file of files) {
      imagenUrls.push(await this.cloudinaryService.uploadImage(file));
    }
  }
  return this.productoService.updateMultipleImages(id, body, imagenUrls);
}


  // 🖼 Eliminar imagen principal del producto
  @Put(':id/remover-imagen')
  removeImagen(@Param('id') id: string) {
    return this.productoService.removeImagen(id);
  }

  // 📢 Publicar producto
  @Put(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.productoService.publicar(id);
  }

  // =======================
  // ✏️ PATCH
  // =======================

  // Actualizar categoría
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

  // Eliminar sección
  @Delete('secciones/:id')
  eliminarSeccion(@Param('id') id: string) {
    return this.productoService.eliminarSeccion(id);
  }

  // Eliminar producto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }

  // Eliminar categoría
  @Delete('categorias/:id')
  eliminarCategoria(@Param('id') id: string) {
    return this.productoService.eliminarCategoria(id);
  }
}
