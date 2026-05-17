import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

// Importación del Middleware
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware';

// Tus Módulos
import { PrismaModule } from './prisma/prisma.module';
import { ProductoModule } from './producto/producto.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './claudinary/cloudinary.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TestModule } from './test/test.module';
import { CartModule } from './cart/cart.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { FavoritoModule } from './favorito/favorito.module';
import { MailModule } from './mail/mail.module';
import { PurchaseModule } from './purchase/purchase.module';
import { HistorialModule } from './historial/historial.module';
import { LocalAuthModule } from './auth/local/local.module';
import { PuntoEntregaModule } from './punto-entrega/punto-entrega.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { PaymentsModule } from './payments/payments.module';
import { CorreoModule } from './correo/correo.module';
import { PromocionModule } from './promocion/promocion.module';
import { ConfiguracionTiendaModule } from './configuracion-tienda/configuracion-tienda.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ProductoModule,
    AuthModule,
    CloudinaryModule,
    DashboardModule,
    TestModule,
    CartModule,
    ComentariosModule,
    FavoritoModule,
    MailModule,
    PurchaseModule,
    HistorialModule,
    LocalAuthModule,
    PuntoEntregaModule,
    OrdenesModule,
    PaymentsModule,
    CorreoModule,
    PromocionModule,
    ConfiguracionTiendaModule,
    // ❌ Quitamos MaintenanceMiddleware de aquí
  ],
})
// ✅ Implementamos NestModule para poder configurar el middleware
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintenanceMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    // Esto protege absolutamente todos los endpoints
  }
}