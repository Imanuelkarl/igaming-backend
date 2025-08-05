// src/game-session/game-session.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
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
    const session = await this.gameSessionService.getAllActiveSessions();
    if (!session) {
      return { message: 'No active session available' };
    }
    
    
    
    return {
      session
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async joinSession(@GetUser() req : any  , @Body() body: { selectedNumber: number , sessionId : number }) {
    const userId = req.sub;
    return this.gameSessionService.joinSession(userId, body.selectedNumber , body.sessionId);
  }

  /*@UseGuards(JwtAuthGuard)
  @Post('create')
  async createSession(@Body() body: { selectedNumber: number }) {
    return this.gameSessionService.createSession(body.selectedNumber);
  }*/

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllSessions() {
    return this.gameSessionService.getAllSessions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-active')
  async getAllActiveSessions() {
    return this.gameSessionService.getAllActiveSessions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findSessionById(@Param('id') id: number) {
    return this.gameSessionService.getSessionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leave')
  async leaveSession(@GetUser() req: any,@Body() body :{ sessionId : number}) {
    const userId = req.sub;
    return this.gameSessionService.leaveSession(userId, body.sessionId);
  }

  @Get('top-players')
  async getTopPlayers() {
    return this.gameSessionService.getTopPlayers();
  }
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSession(@GetUser() req: any, @Body() body: { selectedNumber: number }) {
    const userId = req.sub;
    return this.gameSessionService.createNewSession(userId, body.selectedNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions-by-date')
  async getSessionsGroupedByDate() {
    return this.gameSessionService.getSessionsGroupedByDate();
  }
}