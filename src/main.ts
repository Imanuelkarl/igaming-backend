import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173','imanuelkarl.github.io'], // 👈 frontend URL (React, Angular, etc.)
    credentials: true,               // 👈 if you're using cookies or auth headers
  });

  await app.listen(3000);
}
bootstrap();