import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const config = await this.prisma.configuracionTienda.findFirst();
        if (!config || !config.mantenimientoActivo) return next();

        // 1. Rutas esenciales de la API que jamás se bloquean
        const isEssentialPath =
            req.url.includes('/auth') ||
            req.url.includes('/configuracion-tienda');

        if (isEssentialPath) return next();

        // 2. ¿Es el ADMIN real navegando? (Validación por Cookie)
        // Buscamos si en las cookies del backend viaja un token de sesión
        const cookies = req.headers.cookie;
        if (cookies) {
            // Buscamos tu token local o el token que seteas en /set-cookie
            const tokenMatch = cookies.match(/(?:^|; )token=([^;]*)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            if (token) {
                try {
                    const decoded: any = jwt.decode(token);
                    // Si el rol decodificado de la cookie es ADMIN, pasa libre sin importar nada
                    if (decoded && decoded.role === 'ADMIN') {
                        return next();
                    }
                } catch (e) {
                    // Token inválido, ignoramos
                }
            }
        }

        // 3. ¿Trae el "Pase VIP" en los headers? (Clientes con el código ingresado)
        const vipHeader = req.headers['x-maintenance-code'];
        if (vipHeader === config.mantenimientoCodigo) {
            return next();
        }

        // 4. Si no es ruta esencial, no es admin y no tiene código VIP => Bloqueamos 503
        throw new ServiceUnavailableException({
            statusCode: 503,
            message: config.mantenimientoMensaje,
            error: 'Maintenance Mode',
        });
    }
}