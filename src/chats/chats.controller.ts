import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatsService } from './chats.service';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('user-chats')
  async getUserChats(@Request() req) {
    return this.chatsService.getUserChats(req.user._id.toString());
  }

  @Get('messages/:contactId')
  async getMessages(@Request() req, @Param('contactId') contactId: string) {
    return this.chatsService.getMessages(
      req.user._id.toString(),
      contactId,
    );
  }

  @Post('mark-read')
  async markRead(@Request() req, @Body() body: { senderId: string }) {
    return this.chatsService.markMessagesRead(
      body.senderId,
      req.user._id.toString(),
    );
  }

  @Delete(':contactId')
  async deleteChat(@Request() req, @Param('contactId') contactId: string) {
    return this.chatsService.deleteChat(req.user._id.toString(), contactId);
  }
}