import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CorreoService } from './correo.service';
import { CorreoController } from './correo.controller';

@Module({
  imports: [HttpModule],
  providers: [CorreoService],
  controllers: [CorreoController],
  exports: [CorreoService],
})
export class CorreoModule { }
