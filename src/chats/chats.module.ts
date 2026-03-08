import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Message, MessageSchema } from './message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema }
    ])
  ],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService]
})
export class ChatsModule {}