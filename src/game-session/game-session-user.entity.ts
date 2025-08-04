
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { GameSession } from './game-session.entity';

@Entity()
export class GameSessionUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  selectedNumber: number;

  @Column({ default: false })
  isWinner: boolean;

  @ManyToOne(() => User, user => user.gameSessions)
  user: User;

  @ManyToOne(() => GameSession, gameSession => gameSession.users)
  gameSession: GameSession;

  @Column({ default: false })
  isCreator: boolean;
}