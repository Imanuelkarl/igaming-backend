// src/game-session/game-session.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between, Not, In } from 'typeorm';
import { GameSession } from './game-session.entity';
import { GameSessionUser } from './game-session-user.entity';
import { User } from '../user/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { get } from 'http';

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
    
  }

 @Cron(CronExpression.EVERY_5_SECONDS)
  async handleSessionCycle() {
    try {
      
      const allActiveSessions = await this.getAllActiveSessions();
      
      for (const session of allActiveSessions) {
        const differenceInSeconds = (new Date().getTime() - new Date(session.startTime).getTime()) / 1000;
        if (differenceInSeconds >300) {
          // End session if time is up
          console.log("times up");
          session.state = "ended";
          await this.gameSessionRepository.save(session);
          
          // Determine winners
          await this.determineWinners(session.id);
          console.log(`Session ${session.id} ended and winners determined`);
        }
      }
    } catch (error) {
      console.error('Error in session cycle handler:', error);
    }
  }
  async getCurrentSessionForUser(userId: number) {
  const participation = await this.gameSessionUserRepository.findOne({
    where: {
      user: { id: userId },
      gameSession: {
        state: In(['active', 'waiting']), // Only include ongoing sessions
      },
    },
    relations: ['gameSession', 'gameSession.users', 'gameSession.users.user'],
  });
  console.log(participation);
  console.log("Helo world");

  if (!participation) {
    return null; // Or throw an error if preferred
  }

  return participation.gameSession;
}


  async createNewSession( creatorId: number) {
    const now = new Date();
    
    const endTime = new Date(now.getTime() + 300000); // 300 seconds
    
    const newSession = this.gameSessionRepository.create({
      startTime: now,
      endTime,
      creatorId: creatorId,
      state: 'waiting',
    });
    const activeSession = await this.gameSessionRepository.save(newSession);
    await this.joinSession(creatorId,0, activeSession.id); // Automatically join creator with number 0
    return activeSession;
  }
  async getSessionById(sessionId: number) {
    return this.gameSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['users', 'users.user'],
    });
  }
  async selectNumber(userId: number, selectedNumber: number, sessionId: number) {
  // Step 1: Find the user's participation in the session
  const participation = await this.gameSessionUserRepository.findOne({
    where: {
      user: { id: userId },
      gameSession: { id: sessionId },
    },
    relations: ['gameSession'],
  });

  if (!participation) {
    throw new Error('User is not part of the specified session');
  }

  // Step 2: Check if the session is still in a modifiable state
  /*if (participation.gameSession.state !== 'waiting') {
    throw new Error('Cannot change number. Game has already started');
  }*/

  // Step 3: Update selected number
  participation.selectedNumber = selectedNumber;
  await this.gameSessionUserRepository.save(participation);

  return {
    message: 'Number selection updated successfully',
    selectedNumber,
  };
}

  async joinSession(userId: number, selectedNumber: number, sessionId?: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Check if user is already in an active session
    const existingParticipation = await this.gameSessionUserRepository.findOne({
      where: {
        user: { id: userId },
        gameSession: { state: ("active") },
      },
    });
    
    if (existingParticipation) {
      throw new Error('User already in an active session');
    }
    
    const activeSession = await this.getSessionById(sessionId || 0) ;
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
    
    
    
    const participation = this.gameSessionUserRepository.create({
      user: user || undefined,
      gameSession: activeSession,
      selectedNumber,
      
    });
    
    return this.gameSessionUserRepository.save(participation);
  }


  async leaveSession(userId: number , sessionId?: number) {
    const activeSession = await this.getSessionById(sessionId || 0);
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
  async startGame(sessionId: number) {
    const session = await this.getSessionById(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.state = 'active';
    session.startTime = new Date(); // Optional: Reset startTime if needed

    await this.gameSessionRepository.save(session);
    return session;
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
  async getAllSessions() {
    return this.gameSessionRepository.find({
      order: { startTime: 'DESC' },
      relations: ['users', 'users.user'],
    });
  }
  
  async getAllActiveSessions() {
    const now = new Date();
    return this.gameSessionRepository.find({
      where: {
        
        state: 'active',
      },
      relations: ['users', 'users.user'],
    });
  }
  async getAllWaitingSessions() {
    const now = new Date();
    return this.gameSessionRepository.find({
      where: {
        
        state: 'waiting',
      },
      relations: ['users', 'users.user'],
    });
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

 
}