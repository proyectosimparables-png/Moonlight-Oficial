import { Controller, Get } from '@nestjs/common';

@Controller('test') // la ruta base
export class TestController {
  @Get('ping')
  ping() {
    console.log('✅ Ping recibido en TestController');
    return { message: 'pong desde test' };
  }
}
