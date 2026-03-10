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
    console.log(`[DEBUG] GET /chats/user-chats for user ${req.user._id}`);
    return this.chatsService.getUserChats(req.user._id.toString());
  }

  @Get('messages/:contactId')
  async getMessages(@Request() req, @Param('contactId') contactId: string) {
    console.log(`[DEBUG] GET /chats/messages/${contactId} for user ${req.user._id}`);
    return this.chatsService.getMessages(
      req.user._id.toString(),
      contactId,
    );
  }

  @Post('mark-read')
  async markRead(@Request() req, @Body() body: { senderId: string }) {
    console.log(`[DEBUG] POST /chats/mark-read from sender ${body.senderId} for receiver ${req.user._id}`);
    return this.chatsService.markMessagesRead(
      body.senderId,
      req.user._id.toString(),
    );
  }

  @Delete('message/:messageId')
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    console.log(`[DEBUG] DELETE /chats/message/${messageId} by user ${req.user._id}`);
    return this.chatsService.deleteMessage(messageId, req.user._id.toString());
  }

  @Delete(':contactId')
  async deleteChat(@Request() req, @Param('contactId') contactId: string) {
    console.log(`[DEBUG] DELETE /chats/${contactId} by user ${req.user._id}`);
    return this.chatsService.deleteChat(req.user._id.toString(), contactId);
  }
}