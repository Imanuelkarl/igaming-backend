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
        type: 'mysql',
        host: 'localhost', // or your database host
        port: 3306, // default MySQL port
        username: 'root',
        password: 'Chuka200116.',
        database: 'igaming',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    
    AuthModule,
    UserModule,
    GameSessionModule,
  ],
})
export class AppModule {}