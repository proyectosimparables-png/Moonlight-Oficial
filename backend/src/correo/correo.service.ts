import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta según tu proyecto

@Injectable()
export class CorreoService {
    private token: string | null = null;
    private tokenExpire: Date | null = null;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService, // 👈 Agregado para buscar productos
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
     * @param items Array de { productoId: string, cantidad: number }
     */
    async getRates(cpDestino: string, items: { productoId: string, cantidad: number }[]) {
        const baseUrl = this.configService.get<string>('CORREO_BASE_URL');
        const cpOrigen = this.configService.get<string>('CORREO_CP_ORIGEN');
        const customerId = this.configService.get<string>('CORREO_CUSTOMER_ID'); // Asegúrate de tenerlo en el .env
        const token = await this.getToken();

        // Verificar que los items contienen datos correctos
        console.log("Items recibidos:", items);

        // Si `items` está vacío, no se hace la consulta
        if (items.length === 0) {
            console.warn("El array 'items' está vacío, no se puede hacer la consulta.");
            return [];
        }

        const productosDB = await this.prisma.producto.findMany({
            where: { id: { in: items.map(i => i.productoId) } }
        });

        // Verificar los `productoId` que estamos buscando en la consulta
        console.log("Producto IDs que se están buscando:", items.map(i => i.productoId));

        // Logs para verificar los productos obtenidos de la base de datos
        console.log("Productos obtenidos de la base de datos:", productosDB);

        let pesoTotalGramos = 0;
        let maxAlto = 0;
        let maxAncho = 0;
        let maxLargo = 0;

        items.forEach(item => {
            const p = productosDB.find(prod => prod.id === item.productoId);
            if (p) {
                // Logs para verificar el producto y sus dimensiones
                console.log(`Producto ${p.id} encontrado:`, p);
                console.log(`Peso: ${p.peso}, Alto: ${p.alto}, Ancho: ${p.ancho}, Profundidad: ${p.profundidad}`);

                // Cálculos del peso y dimensiones
                pesoTotalGramos += (p.peso || 500) * item.cantidad;
                if ((p.alto || 0) > maxAlto) maxAlto = p.alto || 0;
                if ((p.ancho || 0) > maxAncho) maxAncho = p.ancho || 0;
                if ((p.profundidad || 0) > maxLargo) maxLargo = p.profundidad || 0;
            }
        });

        // Logs para verificar los valores calculados
        console.log("Peso total calculado (en gramos):", pesoTotalGramos);
        console.log("Dimensiones máximas calculadas - Alto:", maxAlto, "Ancho:", maxAncho, "Largo:", maxLargo);

        // RequestData siguiendo exactamente la página 9 del manual 
        const requestData = {
            customerId: customerId, // Obligatorio 
            postalCodeOrigin: cpOrigen, // Obligatorio 
            postalCodeDestination: cpDestino, // Obligatorio 
            // deliveredType: "D", // Opcional si querés ambos, o fijar uno [cite: 589, 663]
            dimensions: {
                weight: Math.round(pesoTotalGramos), // Debe ser entero 
                height: Math.round(maxAlto) || 10,
                width: Math.round(maxAncho) || 10,
                length: Math.round(maxLargo) || 10
            }
        };

        // Log para verificar el objeto requestData antes de enviarlo
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

            // LOG CRUCIAL: Ver qué responde la API antes de mapear
            console.log("Respuesta cruda de Correo:", JSON.stringify(response.data, null, 2));

            if (!response.data || !response.data.rates || response.data.rates.length === 0) {
                console.warn("La API de Correo no devolvió tarifas para estos datos.");
                return [];
            }

            // Mapeo según la respuesta de la página 11 del manual [cite: 677]
            return response.data.rates.map(rate => ({
                nombre: rate.productName,
                precio: rate.price,
                productType: rate.productType,
                deliveredType: rate.deliveredType,
                plazoMin: rate.deliveryTimeMin,
                plazoMax: rate.deliveryTimeMax
            }));
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error al cotizar con Correo';
            console.error("DETALLE ERROR CORREO:", error.response?.data);
            throw new HttpException(errorMsg, HttpStatus.BAD_REQUEST);
        }
    }
}