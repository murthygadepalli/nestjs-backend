import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './group.schema';
import { GroupMessage, GroupMessageSchema } from './group-message.schema';
import { GroupsGateway } from './groups.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupMessage.name, schema: GroupMessageSchema },
    ]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsGateway],
})
export class GroupsModule { }