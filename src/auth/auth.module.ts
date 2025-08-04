// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    /*JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),*/
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'default-secret-key',
        signOptions: { expiresIn: '1h' },
    }),
    // Import UserService to use it in AuthService

  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, UserService],
  controllers: [AuthController],
  exports: [JwtModule , JwtAuthGuard]
  
})
export class AuthModule {}


