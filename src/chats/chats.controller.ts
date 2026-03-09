// chats.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('user-chats')
  async getUserChats(@Query('userId') userId: string) {
    return this.chatsService.getUserChats(userId);
  }

  
}