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
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { CloudinaryService } from 'src/claudinary/cloudinary.service';

@Controller('productos')
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // 🧩 Crear producto (sin imagen)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  // 🧩 Crear producto con imagen
  @Post('upload-producto')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadProducto(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductoDto,
  ) {
    if (!file) throw new BadRequestException('No se subió ninguna imagen');

    const imagenUrl = await this.cloudinaryService.uploadImage(file);

    return this.productoService.create(
      {
        ...body,
        seccionId: body.seccionId ? String(body.seccionId) : undefined,
        categoriaId: String(body.categoriaId),
      },
      imagenUrl,
    );
  }

  // 📦 Obtener productos
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

  // 🔍 Obtener producto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  // ✏️ Actualizar producto (sin imagen)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProductoDto) {
    return this.productoService.update(id, dto);
  }

  // ✏️ Actualizar producto (con nueva imagen)
  @Put(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProductoWithImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductoDto,
  ) {
    const imagenUrl = file ? await this.cloudinaryService.uploadImage(file) : undefined;
    return this.productoService.update(id, body, imagenUrl);
  }

  // 🖼 Eliminar imagen del producto
  @Put(':id/remover-imagen')
  removeImagen(@Param('id') id: string) {
    return this.productoService.removeImagen(id);
  }

  // 🗑 Eliminar producto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }

  // 📢 Publicar producto
  @Put(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.productoService.publicar(id);
  }


// Obtener secciones
  @Get('secciones')
  getSecciones() {
    return this.productoService.getSecciones();
  }


  // 📚 Obtener categorías (todas o por sección)
  @Get('categorias')
  getCategorias(@Query('seccionId') seccionId?: string) {
    if (!seccionId) return this.productoService.getTodasLasCategorias();
    return this.productoService.getCategoriasPorSeccion(seccionId);
  }

  // ➕ Crear categoría
  @Post('categorias')
  crearCategoria(
    @Body() data: { nombre: string; seccionNombre: string; padreId?: string },
  ) {
    return this.productoService.crearCategoria(data);
  }

  // ✏️ Actualizar categoría
  @Patch('categorias/:id')
  actualizarCategoria(
    @Param('id') id: string,
    @Body() data: { nombre?: string; seccionId?: string },
  ) {
    return this.productoService.actualizarCategoria(id, data);
  }

  // 🗑 Eliminar categoría
  @Delete('categorias/:id')
  eliminarCategoria(@Param('id') id: string) {
    return this.productoService.eliminarCategoria(id);
  }
}
