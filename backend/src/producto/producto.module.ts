import { Module } from '@nestjs/common';
import { ProductoController } from './producto.controller';
import { ProductoService } from './producto.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/claudinary/cloudinary.module';



@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductoController],
  providers: [ProductoService]
})
export class ProductoModule {}
