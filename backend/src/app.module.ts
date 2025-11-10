import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProductoModule } from './producto/producto.module';
import { AuthModule } from './auth/auth.module'; // ✅ de tu rama
import { AdminModule } from './admin/admin.module'; // ✅ de la rama maca
import { CloudinaryModule } from './claudinary/cloudinary.module'; // ✅ de la rama maca
//import { DashboardModule } from './dashboard/dashboard.module';
import { TestModule } from './test/test.module';
import { CartModule } from './cart/cart.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { FavoritoModule } from './favorito/favorito.module';


@Module({
  imports: [
    PrismaModule,
    ProductoModule,
    AuthModule,
    AdminModule,
    CloudinaryModule,
   // DashboardModule,
    TestModule,
    CartModule,
    ComentariosModule,
    FavoritoModule,

  ],
})
export class AppModule { }
