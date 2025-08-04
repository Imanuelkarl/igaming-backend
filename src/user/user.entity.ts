// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GameSessionUser } from '../game-session/game-session-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;

  @OneToMany(() => GameSessionUser, gameSessionUser => gameSessionUser.user)
  gameSessions: GameSessionUser[];
}



