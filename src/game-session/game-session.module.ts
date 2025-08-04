// src/game-session/game-session.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from './game-session.entity';
import { GameSessionUser } from './game-session-user.entity';
import { GameSessionService } from './game-session.service';
import { GameSessionController } from './game-session.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, GameSessionUser]),
    UserModule,
    ConfigModule,
    AuthModule,
  ],
  providers: [GameSessionService],
  controllers: [GameSessionController],
  exports: [GameSessionService],
})
export class GameSessionModule {}