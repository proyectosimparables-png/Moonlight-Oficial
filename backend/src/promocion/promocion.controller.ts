import { Controller, Post, Get, Body, Delete, Param, Query, ParseFloatPipe } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { CreateCuponDto } from './dto/create-cupon.dto';

@Controller('promociones')
export class PromocionController {
    constructor(private readonly promocionService: PromocionService) { }

    @Post()
    create(@Body() createPromocionDto: CreatePromocionDto) {
        return this.promocionService.create(createPromocionDto);
    }

    @Get()
    findAll() {
        return this.promocionService.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.promocionService.remove(id);
    }


    // --- SECCIÓN: CUPONES ---

    @Post('cupon')
    createCupon(@Body() createCuponDto: CreateCuponDto) {
        return this.promocionService.createCupon(createCuponDto);
    }

    @Get('cupon')
    findAllCupones() {
        return this.promocionService.findAllCupones();
    }

    // Endpoint clave para el carrito de Moonlight
    @Get('validar-cupon/:codigo')
    validarCupon(
        @Param('codigo') codigo: string,
        @Query('montoCarrito') montoCarrito: string // Recibilo como string
    ) {
        const monto = parseFloat(montoCarrito); // Convertilo acá
        return this.promocionService.validarCupon(codigo, monto);
    }

    @Delete('cupon/:id')
    removeCupon(@Param('id') id: string) {
        return this.promocionService.removeCupon(id);
    }
}


