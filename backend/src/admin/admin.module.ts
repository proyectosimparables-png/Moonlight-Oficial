import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService, AdminService],
})
export class AdminModule {}
