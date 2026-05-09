import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductoModule } from './producto/producto.module';
import { AuthModule } from './auth/auth.module'; // ✅ de tu rama
import { CloudinaryModule } from './claudinary/cloudinary.module'; // ✅ de la rama maca
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
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentsModule } from './payments/payments.module';
import { CorreoModule } from './correo/correo.module';
import { ConfigModule } from '@nestjs/config';
import { PromocionModule } from './promocion/promocion.module';
import { ConfiguracionTiendaModule } from './configuracion-tienda/configuracion-tienda.module';



@Module({
  imports: [
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
    LocalAuthModule, PuntoEntregaModule, OrdenesModule, PaymentsModule, CorreoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PromocionModule,
    ConfiguracionTiendaModule,


  ],
})
export class AppModule { }
