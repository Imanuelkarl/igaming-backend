// src/user/user.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('top')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getTopPlayers() {
    return this.userService.getTopPlayers();
  }
}