// src/game-session/game-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GameSessionUser } from './game-session-user.entity';

@Entity()
export class GameSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: 30})
  span: number;

  @Column({ nullable: true })
  winningNumber: number;

  @Column({ nullable: true })
  creatorId: number;

  @Column( {default : "isActive"})
  state: string;


  @OneToMany(() => GameSessionUser, gameSessionUser => gameSessionUser.gameSession)
  users: GameSessionUser[];
}