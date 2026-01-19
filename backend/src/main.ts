import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Usar cookie-parser para habilitar lectura de cookies
  app.use(cookieParser());

  // 🛡️ Activar validación automática
 app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  transform: true, // <--- ESTO DEBE ESTAR EN TRUE
  transformOptions: {
    enableImplicitConversion: true,
  },
}));

  // 🌐 Habilitar CORS para el frontend en 3001
  app.enableCors({
    origin: 'http://localhost:3001', // URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // permite mandar JWT o cookies
  });

  await app.listen(3000);
  console.log('Backend corriendo en http://localhost:3000');
}
bootstrap();
