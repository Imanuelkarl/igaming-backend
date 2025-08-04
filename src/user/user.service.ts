import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByUsername(username: string): Promise<User| null | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async create(username: string): Promise<User> {
    const user = this.userRepository.create({ username });
    return this.userRepository.save(user);
  }

  async updateUserStats(userId: number, wins: number, losses: number): Promise<User | null> {
    await this.userRepository.update(userId, { wins, losses });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getTopPlayers(limit: number = 10): Promise<User[]> {
    return this.userRepository.find({
      order: { wins: 'DESC' },
      take: limit,
    });
  }
}