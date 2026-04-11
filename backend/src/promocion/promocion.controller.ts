import { Controller, Post, Get, Body, Delete, Param } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';

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
}