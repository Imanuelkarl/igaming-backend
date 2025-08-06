// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameSessionModule } from './game-session/game-session.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true, // Makes the configuration available globally
        envFilePath: '.env', // Load environment variables from .env file
      }
    ),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    ssl: { rejectUnauthorized: false }, // Neon requires this
    synchronize: true, // WARNING: Turn this off in production
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
}),
    
    AuthModule,
    UserModule,
    GameSessionModule,
  ],
})
export class AppModule {}