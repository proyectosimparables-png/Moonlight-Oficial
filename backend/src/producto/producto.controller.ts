import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
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

  // ✅ Crear producto (sin imagen)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.productoService.create(dto);
  }

  // ✅ Obtener todos los productos
  @Get()
findAll(
  @Query('published') published?: string,
  @Query('seccionId') seccionId?: string,
  @Query('categoriaId') categoriaId?: string,
  @Query('tipoPrendaId') tipoPrendaId?: string,
) {
  const isPublished =
    published === 'true' ? true : published === 'false' ? false : undefined;

  return this.productoService.findAll(
    isPublished,
    seccionId,
    categoriaId,
    tipoPrendaId,
  );
}

  // ✅ Crear producto con imagen
  @Post('upload-producto')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadProducto(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductoDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const imagenUrl = await this.cloudinaryService.uploadImage(file);

    return this.productoService.create(
      {
        ...body,
        seccionId: body.seccionId ? String(body.seccionId) : undefined,
        categoriaId: String(body.categoriaId),
        tipoPrendaId: String(body.tipoPrendaId),
      },
      imagenUrl,
    );
  }

  // ✅ Actualizar producto (sin imagen)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: CreateProductoDto) {
    return this.productoService.update(id, dto);
  }
   @Put(':id/remover-imagen')
async removeImagen(@Param('id') id: string) {
  return this.productoService.removeImagen(id);
}

  // ✅ Actualizar producto con nueva imagen
  @Put(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProductoWithImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductoDto,
  ) {
    let imagenUrl: string | undefined;

    if (file) {
      imagenUrl = await this.cloudinaryService.uploadImage(file);
    }

    return this.productoService.update(id, body, imagenUrl);
  }
 


  // ✅ Eliminar producto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }

  // ✅ Publicar producto
  @Put(':id/publicar')
  publicar(@Param('id') id: string) {
    return this.productoService.publicar(id);
  }

  // ✅ Obtener secciones
  @Get('secciones')
  getSecciones() {
    return this.productoService.getSecciones();
  }

  // ✅ Obtener categorías por sección
  @Get('categorias')
  getCategorias(@Query('seccionId') seccionId: string) {
    return this.productoService.getCategoriasBySeccion(seccionId);
  }

  // ✅ Obtener tipos de prenda
  @Get('tipo-prenda')
  getTiposPrenda() {
    return this.productoService.getTiposPrenda();
  }

  // ✅ Obtener producto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }
}
