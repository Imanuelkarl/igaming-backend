import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
  'http://localhost:5173',
  'https://igame-projects.netlify.app',
  'https://imanuelkarl.gitub.io'
];
  // ✅ Enable CORS
  app.enableCors({
    origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, // 👈 frontend URL (React, Angular, etc.)
    credentials: true,               // 👈 if you're using cookies or auth headers
  });

  await app.listen(3000);
}
bootstrap();