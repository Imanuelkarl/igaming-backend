// src/game-session/game-session.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between, Not } from 'typeorm';
import { GameSession } from './game-session.entity';
import { GameSessionUser } from './game-session-user.entity';
import { User } from '../user/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameSessionService implements OnModuleInit {
  private readonly maxPlayersPerSession: number;

  constructor(
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession >,
    @InjectRepository(GameSessionUser)
    private gameSessionUserRepository: Repository<GameSessionUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.maxPlayersPerSession = this.configService.get<number>('MAX_PLAYERS_PER_SESSION', 10);
  }

  async onModuleInit() {
    await this.ensureActiveSession();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleSessionCycle() {
    const activeSession = await this.getActiveSession();
    if (activeSession) {
      // End current session
      activeSession.isActive = false;
      await this.gameSessionRepository.save(activeSession);
      
      // Determine winners
      await this.determineWinners(activeSession.id);
    }
    
    // Start new session
    await this.createNewSession();
  }

  async createNewSession() {
    const now = new Date();
    const endTime = new Date(now.getTime() + 20000); // 20 seconds
    
    const newSession = this.gameSessionRepository.create({
      startTime: now,
      endTime,
      isActive: true,
    });
    
    return this.gameSessionRepository.save(newSession);
  }

  async getActiveSession() {
    const now = new Date();
    return this.gameSessionRepository.findOne({
      where: {
        startTime: LessThan(now),
        endTime: MoreThan(now),
        isActive: true,
      },
      relations: ['users', 'users.user'],
    });
  }

  async joinSession(userId: number, selectedNumber: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Check if user is already in an active session
    const existingParticipation = await this.gameSessionUserRepository.findOne({
      where: {
        user: { id: userId },
        gameSession: { isActive: true },
      },
    });
    
    if (existingParticipation) {
      throw new Error('User already in an active session');
    }
    
    const activeSession = await this.getActiveSession();
    if (!activeSession) {
      throw new Error('No active session available');
    }
    
    // Check if session is full
    const playerCount = await this.gameSessionUserRepository.count({
      where: { gameSession: { id: activeSession.id } },
    });
    
    if (playerCount >= this.maxPlayersPerSession) {
      throw new Error('Session is full');
    }
    
    const isCreator = playerCount === 0;
    
    const participation = this.gameSessionUserRepository.create({
      user: user || undefined,
      gameSession: activeSession,
      selectedNumber,
      isCreator,
    });
    
    return this.gameSessionUserRepository.save(participation);
  }

  async leaveSession(userId: number) {
    const activeSession = await this.getActiveSession();
    if (!activeSession) {
      throw new Error('No active session available');
    }
    
    const participation = await this.gameSessionUserRepository.findOne({
      where: {
        user: { id: userId },
        gameSession: { id: activeSession.id },
      },
    });
    
    if (!participation) {
      throw new Error('User not in this session');
    }
    
    await this.gameSessionUserRepository.remove(participation);
    return true;
  }

  async determineWinners(sessionId: number) {
    const session = await this.gameSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['users', 'users.user'],
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Pick random winning number (1-9)
    const winningNumber = Math.floor(Math.random() * 9) + 1;
    session.winningNumber = winningNumber;
    await this.gameSessionRepository.save(session);
    
    // Find winners
    const winners = await this.gameSessionUserRepository.find({
      where: {
        gameSession: { id: sessionId },
        selectedNumber: winningNumber,
      },
      relations: ['user'],
    });
    
    // Update user stats
    for (const winner of winners) {
      winner.isWinner = true;
      await this.gameSessionUserRepository.save(winner);
      
      const user = winner.user;
      user.wins += 1;
      await this.userRepository.save(user);
    }
    
    // Update losers stats
    const losers = await this.gameSessionUserRepository.find({
      where: {
        gameSession: { id: sessionId },
        selectedNumber: Not(winningNumber),
      },
      relations: ['user'],
    });
    
    for (const loser of losers) {
      const user = loser.user;
      user.losses += 1;
      await this.userRepository.save(user);
    }
    
    return winners;
  }

  async getTopPlayers(limit: number = 10) {
    return this.userRepository.find({
      order: { wins: 'DESC' },
      take: limit,
    });
  }

  async getSessionsGroupedByDate() {
    const query = `
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as session_count,
        SUM((
          SELECT COUNT(*) 
          FROM game_session_user gsu 
          WHERE gsu.game_session_id = gs.id
        )) as player_count
      FROM game_session gs
      GROUP BY DATE(start_time)
      ORDER BY DATE(start_time) DESC
    `;
    
    return this.gameSessionRepository.query(query);
  }

  private async ensureActiveSession() {
    const activeSession = await this.getActiveSession();
    if (!activeSession) {
      await this.createNewSession();
    }
  }
}