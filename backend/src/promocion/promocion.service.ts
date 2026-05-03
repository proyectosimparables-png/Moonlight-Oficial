import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { CreateCuponDto } from './dto/create-cupon.dto';

@Injectable()
export class PromocionService {
    constructor(private prisma: PrismaService) { }

    // 🔹 Crear Promoción
    async create(data: CreatePromocionDto) {
        const { productosIds, categoriasIds, seccionesIds, fechaInicio, fechaFin, ...promoData } = data;

        const cleanProductosIds = productosIds?.filter(id => id && id.length > 5) || [];
        const cleanCategoriasIds = categoriasIds?.filter(id => id && id.length > 5) || [];
        const cleanSeccionesIds = seccionesIds?.filter(id => id && id.length > 5) || [];

        try {
            return await this.prisma.promocion.create({
                data: {
                    ...promoData,
                    fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
                    fechaFin: fechaFin ? new Date(fechaFin) : null,
                    productos: cleanProductosIds.length > 0 ? { connect: cleanProductosIds.map(id => ({ id })) } : undefined,
                    categorias: cleanCategoriasIds.length > 0 ? { connect: cleanCategoriasIds.map(id => ({ id })) } : undefined,
                    secciones: cleanSeccionesIds.length > 0 ? { connect: cleanSeccionesIds.map(id => ({ id })) } : undefined,
                },
                include: { productos: true, categorias: true, secciones: true },
            });
        } catch (error) {
            throw new BadRequestException('Error al crear la promoción.');
        }
    }

    // 🔹 Obtener todas (Agregamos secciones al listado)
    async findAll(soloActivas: boolean = false) {
        return this.prisma.promocion.findMany({
            where: soloActivas ? { activa: true } : {},
            include: {
                productos: { select: { id: true, nombre: true } },
                categorias: { select: { id: true, nombre: true } },
                secciones: { select: { id: true, nombre: true } }, // 👈 Agregado
            },
            orderBy: { prioridad: 'desc' },
        });
    }

    // 🔹 Actualizar (Agregamos lógica de seccionesIds)
    async update(id: string, data: Partial<CreatePromocionDto>) {
        const { productosIds, categoriasIds, seccionesIds, fechaInicio, fechaFin, ...promoData } = data;

        const existe = await this.prisma.promocion.findUnique({ where: { id } });
        if (!existe) throw new NotFoundException('Promoción no encontrada');

        const cleanProductosIds = productosIds?.filter(id => id && id.length > 5);
        const cleanCategoriasIds = categoriasIds?.filter(id => id && id.length > 5);
        const cleanSeccionesIds = seccionesIds?.filter(id => id && id.length > 5); // 👈 Agregado

        return await this.prisma.promocion.update({
            where: { id },
            data: {
                ...promoData,
                fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
                fechaFin: fechaFin ? new Date(fechaFin) : undefined,
                productos: cleanProductosIds ? {
                    set: [],
                    connect: cleanProductosIds.map(id => ({ id })),
                } : undefined,
                categorias: cleanCategoriasIds ? {
                    set: [],
                    connect: cleanCategoriasIds.map(id => ({ id })),
                } : undefined,
                secciones: cleanSeccionesIds ? { // 👈 Agregado
                    set: [],
                    connect: cleanSeccionesIds.map(id => ({ id })),
                } : undefined,
            },
            include: { productos: true, categorias: true, secciones: true },
        });
    }

    // 🔹 Eliminar
    async remove(id: string) {
        const existe = await this.prisma.promocion.findUnique({ where: { id } });
        if (!existe) throw new NotFoundException('La promoción no existe');

        return this.prisma.promocion.delete({
            where: { id },
        });
    }

    // 🔹 1. Crear Cupón
    async createCupon(data: CreateCuponDto) {
        try {
            return await this.prisma.cupon.create({
                data: {
                    ...data,
                    codigo: data.codigo.toUpperCase(), // Siempre en mayúsculas para evitar errores
                    fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
                    fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
                }
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new BadRequestException('Ya existe un cupón con ese código.');
            }
            throw new BadRequestException('Error al crear el cupón.');
        }
    }

    // 🔹 2. Obtener Cupones (para el Dashboard)
    async findAllCupones() {
        return this.prisma.cupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    // 🔹 3. Validar Cupón (Este es el motor para el Carrito/Checkout)
    async validarCupon(codigo: string, subtotal: number) {
        const cupon = await this.prisma.cupon.findUnique({
            where: { codigo: codigo.toUpperCase() }
        });

        if (!cupon) throw new NotFoundException('Cupón no encontrado.');
        if (!cupon.activo) throw new BadRequestException('El cupón no está activo.');

        const ahora = new Date();
        if (cupon.fechaInicio && ahora < cupon.fechaInicio) throw new BadRequestException('El cupón aún no es válido.');
        if (cupon.fechaFin && ahora > cupon.fechaFin) throw new BadRequestException('El cupón ha expirado.');

        if (cupon.limiteUso && cupon.usados >= cupon.limiteUso) {
            throw new BadRequestException('El cupón ha agotado sus usos.');
        }

        if (subtotal < cupon.minimoCarrito) {
            throw new BadRequestException(`El monto mínimo de compra es $${cupon.minimoCarrito}`);
        }
        if (Number(subtotal) < cupon.minimoCarrito) {
            throw new BadRequestException(`El monto mínimo de compra es $${cupon.minimoCarrito}`);
        }

        return cupon;
    }

    // 🔹 4. Eliminar Cupón
    async removeCupon(id: string) {
        const existe = await this.prisma.cupon.findUnique({ where: { id } });
        if (!existe) throw new NotFoundException('El cupón no existe.');

        return this.prisma.cupon.delete({ where: { id } });
    }
}


