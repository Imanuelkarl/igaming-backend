// src/game-session/game-session.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import express from 'express';
import { GetUser } from 'src/user/user.decorator';

@Controller('game-session')
export class GameSessionController {
  constructor(private gameSessionService: GameSessionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveSession() {
    const session = await this.gameSessionService.getActiveSession();
    if (!session) {
      return { message: 'No active session available' };
    }
    
    const timeLeft = Math.max(0, new Date(session.endTime).getTime() - new Date().getTime());
    
    return {
      ...session,
      timeLeft,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async joinSession(@GetUser() req : any  , @Body() body: { selectedNumber: number }) {
    const userId = req.sub;
    return this.gameSessionService.joinSession(userId, body.selectedNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leave')
  async leaveSession(@GetUser() req: any) {
    const userId = req.sub;
    return this.gameSessionService.leaveSession(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('top-players')
  async getTopPlayers() {
    return this.gameSessionService.getTopPlayers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions-by-date')
  async getSessionsGroupedByDate() {
    return this.gameSessionService.getSessionsGroupedByDate();
  }
}