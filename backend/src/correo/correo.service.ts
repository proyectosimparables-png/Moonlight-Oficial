import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorreoService {
    private token: string | null = null;
    private tokenExpire: Date | null = null;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    private async requestNewToken(): Promise<void> {
        const user = this.configService.get<string>('CORREO_USER');
        const pass = this.configService.get<string>('CORREO_PASS');
        const baseUrl = this.configService.get<string>('CORREO_BASE_URL');

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${baseUrl}/token`,
                    {},
                    {
                        auth: {
                            username: user!,
                            password: pass!,
                        },
                    },
                ),
            );

            this.token = response.data.token;
            this.tokenExpire = new Date(response.data.expire);
        } catch (error) {
            throw new HttpException(
                'Error obteniendo token de Correo Argentino',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getToken(): Promise<string> {
        if (this.token && this.tokenExpire && new Date() < this.tokenExpire) {
            return this.token;
        }
        await this.requestNewToken();
        return this.token!;
    }

    /**
     * @param cpDestino Código postal del cliente
     * @param items Array de { productoId: string, cantidad: number } (Contiene el UUID de la variante)
     */
    async getRates(cpDestino: string, items: { productoId: string, cantidad: number }[]) {
        const baseUrl = this.configService.get<string>('CORREO_BASE_URL');
        const cpOrigen = this.configService.get<string>('CORREO_CP_ORIGEN');
        const customerId = this.configService.get<string>('CORREO_CUSTOMER_ID');
        const token = await this.getToken();

        console.log("Items recibidos en Backend:", items);

        if (items.length === 0) {
            console.warn("El array 'items' está vacío, no se puede hacer la consulta.");
            return [];
        }

        // 🌟 CORRECCIÓN CRUCIAL: Buscamos en la tabla 'variante' por su UUID e incluimos el producto relacionado
        const variantesDB = await this.prisma.variante.findMany({
            where: { id: { in: items.map(i => i.productoId) } },
            include: { producto: true }
        });

        console.log("Variantes IDs buscados:", items.map(i => i.productoId));
        console.log("Variantes obtenidas de la base de datos con su producto:", variantesDB);

        let pesoTotalGramos = 0;
        let maxAlto = 0;
        let maxAncho = 0;
        let maxLargo = 0;

        items.forEach(item => {
            // Buscamos la variante coincidente
            const v = variantesDB.find(vari => vari.id === item.productoId);

            // Si encontramos la variante y tiene un producto asociado, extraemos las métricas de logística
            if (v && v.producto) {
                const p = v.producto;
                console.log(`Variante ${v.id} mapeada al Producto ${p.id}:`, p.nombre);

                // Sumamos peso acumulado (Si el campo está vacío, ponemos 500g de fallback por prenda)
                pesoTotalGramos += (p.peso || 500) * item.cantidad;

                // Calculamos las dimensiones máximas de la caja contenedora
                if ((p.alto || 0) > maxAlto) maxAlto = p.alto || 0;
                if ((p.ancho || 0) > maxAncho) maxAncho = p.ancho || 0;
                if ((p.profundidad || 0) > maxLargo) maxLargo = p.profundidad || 0;
            }
        });

        // Si por alguna razón ninguna variante coincidió, forzamos un mínimo para que el correo no rebote con 0
        if (pesoTotalGramos === 0) {
            console.warn("⚠️ Advertencia: No se encontraron dimensiones reales en la DB. Usando fallback mínimo.");
            pesoTotalGramos = 500;
        }

        const requestData = {
            customerId: customerId,
            postalCodeOrigin: cpOrigen,
            postalCodeDestination: cpDestino,
            dimensions: {
                weight: Math.round(pesoTotalGramos),
                height: Math.round(maxAlto) || 10,
                width: Math.round(maxAncho) || 10,
                length: Math.round(maxLargo) || 10
            }
        };

        console.log("JSON QUE SE ENVÍA A CORREO:", JSON.stringify(requestData, null, 2));

        try {
            const response = await firstValueFrom(
                this.httpService.post(`${baseUrl}/rates`, requestData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            );

            console.log("Respuesta cruda de Correo:", JSON.stringify(response.data, null, 2));

            if (!response.data || !response.data.rates || response.data.rates.length === 0) {
                console.warn("La API de Correo no devolvió tarifas para estos datos.");
                return [];
            }

            return response.data.rates.map(rate => ({
                nombre: rate.productName,
                precio: rate.price,
                productType: rate.productType,
                deliveredType: rate.deliveredType,
                plazoMin: rate.deliveryTimeMin,
                plazoMax: rate.deliveryTimeMax
            }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error al cotizar con Correo';
            console.error("DETALLE ERROR CORREO:", error.response?.data);
            throw new HttpException(errorMsg, HttpStatus.BAD_REQUEST);
        }
    }
}